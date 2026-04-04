const fs = require('fs');
const path = require('path');

class ChatLogger {
    constructor(baseDir = 'chat-history') {
        this.baseDir = baseDir;
        this.logsDir = path.join(baseDir, 'logs');
        this.summariesDir = path.join(baseDir, 'summaries');
        
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
        if (!fs.existsSync(this.summariesDir)) {
            fs.mkdirSync(this.summariesDir, { recursive: true });
        }
    }

    logSessionStart() {
        const now = new Date();
        const sessionId = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        this.currentSessionId = sessionId;
        
        const logEntry = {
            session_id: sessionId,
            start_time: now.toISOString(),
            status: 'started'
        };
        
        const logFile = path.join(this.logsDir, `${sessionId}.json`);
        fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2), 'utf-8');
        
        return sessionId;
    }

    logModification(filePath, description, changes) {
        if (!this.currentSessionId) {
            this.logSessionStart();
        }
        
        const timestamp = new Date().toISOString();
        const logFile = path.join(this.logsDir, `${this.currentSessionId}.json`);
        
        let data = {};
        try {
            const content = fs.readFileSync(logFile, 'utf-8');
            data = JSON.parse(content);
        } catch (e) {
            data = { session_id: this.currentSessionId, modifications: [] };
        }
        
        if (!data.modifications) {
            data.modifications = [];
        }
        
        data.modifications.push({
            timestamp: timestamp,
            file: filePath,
            description: description,
            changes: changes
        });
        
        fs.writeFileSync(logFile, JSON.stringify(data, null, 2), 'utf-8');
    }

    saveSummary(summaryText) {
        if (!this.currentSessionId) {
            this.logSessionStart();
        }
        
        const summaryFile = path.join(this.summariesDir, `${this.currentSessionId}_summary.md`);
        const now = new Date();
        const content = `# Resumen de Sesión: ${this.currentSessionId}\n\n**Fecha:** ${now.toLocaleString()}\n\n${summaryText}`;
        
        fs.writeFileSync(summaryFile, content, 'utf-8');
    }
}

// Prueba del sistema
const logger = new ChatLogger();
logger.logSessionStart();
logger.logModification('chat_logger.js', 'Creación del logger en JavaScript', ['Implementación de clase', 'Métodos de registro']);
logger.saveSummary('Se ha implementado y probado el sistema de logging para el historial de chats.');
console.log('Sistema de logging probado exitosamente.');
