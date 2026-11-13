import { createContext, useState } from 'react';

export const PeriodoContext = createContext();

export function PeriodoProvider({ children }) {
    const dataAtual = new Date();

    const [mesSelecionado, setMesSelecionado] = useState(
        dataAtual.getMonth()
    );

    const [anoSelecionado, setAnoSelecionado] = useState(
        dataAtual.getFullYear()
    );

    return (
        <PeriodoContext.Provider
            value={{
                mesSelecionado,
                setMesSelecionado,
                anoSelecionado,
                setAnoSelecionado
            }}
        >
            {children}
        </PeriodoContext.Provider>
    );
}

