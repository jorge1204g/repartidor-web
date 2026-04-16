export interface Client {
  id: string;
  name: string;
  number: string;
  phone: string;
  startDate: string;
  duration: string;
  weight: number;
  goal: string;
  routines: {
    Lunes: string;
    Martes: string;
    Miércoles: string;
    Jueves: string;
    Viernes: string;
    Sábado: string;
  };
  createdAt: string;
}

export interface User {
  isAuthenticated: boolean;
}
