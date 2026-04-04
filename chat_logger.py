import os
import json
from datetime import datetime

class ChatLogger:
    def __init__(self, base_dir="chat-history"):
        self.base_dir = base_dir
        self.logs_dir = os.path.join(base_dir, "logs")
        self.summaries_dir = os.path.join(base_dir, "summaries")
        os.makedirs(self.logs_dir, exist_ok=True)
        os.makedirs(self.summaries_dir, exist_ok=True)

    def log_session_start(self):
        timestamp = datetime.now()
        session_id = timestamp.strftime("%Y%m%d_%H%M%S")
        self.current_session_id = session_id
        
        log_entry = {
            "session_id": session_id,
            "start_time": timestamp.isoformat(),
            "status": "started"
        }
        
        log_file = os.path.join(self.logs_dir, f"{session_id}.json")
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(log_entry, f, indent=2, ensure_ascii=False)
            
        return session_id

    def log_modification(self, file_path, description, changes):
        if not hasattr(self, 'current_session_id'):
            self.log_session_start()
            
        timestamp = datetime.now().isoformat()
        log_file = os.path.join(self.logs_dir, f"{self.current_session_id}.json")
        
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = {"session_id": self.current_session_id, "modifications": []}
            
        if "modifications" not in data:
            data["modifications"] = []
            
        data["modifications"].append({
            "timestamp": timestamp,
            "file": file_path,
            "description": description,
            "changes": changes
        })
        
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def save_summary(self, summary_text):
        if not hasattr(self, 'current_session_id'):
            self.log_session_start()
            
        summary_file = os.path.join(self.summaries_dir, f"{self.current_session_id}_summary.md")
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(f"# Resumen de Sesión: {self.current_session_id}\n\n")
            f.write(f"**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(summary_text)

# Instancia global para uso fácil
logger = ChatLogger()
