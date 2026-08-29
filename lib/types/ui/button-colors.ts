export type ButtonColor =
    | "primary"
    | "primary-2"
    | "primary-3"
    | "green"
    | "blue"
    | "red"
    | "yellow";

export const buttonColorClasses: Record<ButtonColor, string> = {
    primary: "[--button-color:var(--primary)]",
    "primary-2": "[--button-color:var(--primary-2)]",
    "primary-3": "[--button-color:var(--primary-3)]",
    green: "[--button-color:var(--green)]",
    blue: "[--button-color:var(--blue)]",
    red: "[--button-color:var(--red)]",
    yellow: "[--button-color:var(--yellow)]",
};
