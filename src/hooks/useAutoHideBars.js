
import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { barsAnimation } from './barsAnimation';

export default function useAutoHideBars() {
    const ultimaPosicao = useRef(0);
    const barraOculta = useRef(false);

    useFocusEffect(
        useCallback(() => {
            ultimaPosicao.current = 0;
            barraOculta.current = false;

            barsAnimation.stopAnimation();
            barsAnimation.setValue(0);
        }, [])
    );

    const controlarBarras = useCallback((event) => {
        const posicaoAtual = event.nativeEvent.contentOffset.y;
        const diferenca = posicaoAtual - ultimaPosicao.current;

        let esconder = barraOculta.current;

        if (posicaoAtual <= 10 || diferenca < -5) {
            esconder = false;
        } else if (diferenca > 5) {
            esconder = true;
        }

        if (esconder !== barraOculta.current) {
            barraOculta.current = esconder;

            Animated.timing(barsAnimation, {
                toValue: esconder ? 1 : 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }

        ultimaPosicao.current = posicaoAtual;
    }, []);

    return controlarBarras;
}
