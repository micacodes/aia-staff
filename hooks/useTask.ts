import { useState } from "react";
import useSWR from "swr";
import { api } from "../utils/api";

export const useTask = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const fetchTasks = (task: Partial<Task>) => {
        const { 
            data, 
            error, 
            isLoading 
        } = useSWR<Task[]>('tasks', (url: string) => api.get<{ data: Task[] }>(url).then(res => res.data))

        setIsLoading(isLoading);
        setTasks(data);
        setError(error);
    };

    return {
        tasks,
        fetchTasks,
        isLoading, 
        error
    }
}