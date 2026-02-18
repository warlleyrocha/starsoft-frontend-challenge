import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "./index";

// Hook padrão para dispatch com tipo global da aplicação.
export const useAppDispatch = () => useDispatch<AppDispatch>();
// Hook padrão para selectors com inferência de RootState em toda a aplicação.
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
