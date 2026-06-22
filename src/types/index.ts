export type Machine = {
  id: string;
  name: string;
  description: string;
  location: string;
  image_url: string;
  status: 'available' | 'occupied' | 'maintenance';
};

export type Reservation = {
  id: string;
  user_id: string;
  machine_id: string;
  start_time: string;
  end_time: string;
  checked_in: boolean;
  machine?: Machine;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  exercise_name: string;
  weight_kg: number;
  reps: number;
  sets: number;
  logged_at: string;
};

export type Suggestion = {
  id: string;
  user_id: string;
  prompt: string;
  response_text: string;
  created_at: string;
};
