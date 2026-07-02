import { cn } from "@/lib/utils";

export const PasswordRequirementsPopup = ({ passwordValue, isVisible }) => {
    if (!isVisible) return null;
    
    const hasMinLength = passwordValue.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(passwordValue);
    const hasNumber = /\d/.test(passwordValue);
    const hasSpecial = /[!@#$%^&*]/.test(passwordValue);

    return (
        <div className="absolute top-[105%] left-0 w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg z-50 text-xs pointer-events-none">
            <div className="space-y-3">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Password requirements</p>
                <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-200", hasMinLength ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("transition-colors duration-200", hasMinLength ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-400")}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-200", hasLetter ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("transition-colors duration-200", hasLetter ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-400")}>Contains letters</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-200", hasNumber ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("transition-colors duration-200", hasNumber ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-400")}>Contains at least one number</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-200", hasSpecial ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("transition-colors duration-200", hasSpecial ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-400")}>Contains a special character</span>
                </div>
            </div>
        </div>
    );
};

export const PasswordMatchPopup = ({ passwordValue, confirmPasswordValue, isVisible }) => {
    if (!isVisible || confirmPasswordValue.length === 0) return null;
    
    const doPasswordsMatch = passwordValue === confirmPasswordValue;

    return (
        <div className="absolute top-[105%] left-0 w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg z-50 text-xs pointer-events-none">
            <div className="flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-200", doPasswordsMatch ? "bg-green-500" : "bg-red-500")} />
                <span className={cn("transition-colors duration-200", doPasswordsMatch ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-400")}>
                    {doPasswordsMatch ? "Passwords match" : "Passwords do not match"}
                </span>
            </div>
        </div>
    );
};
