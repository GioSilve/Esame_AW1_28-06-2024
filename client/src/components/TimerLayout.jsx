import { useEffect, useState } from 'react';

export default function TimerLayout(props) {
    const [timer, setTimer] = useState();
    const [secondsLeft, setSecondsLeft] = useState(30);

    useEffect(() => {
        if (props.roundEnded) {
            clearInterval(timer);
        }
    }, [props.roundEnded]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (secondsLeft == 0) {
                clearInterval(timer);
                props.endRound(null, true);
            } else {
                setSecondsLeft(secondsLeft => secondsLeft - 1);
            }
        }, 1000);
        setTimer(timer);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    return (
        <>
            <h3 className="mt-5 mb-5">Time: {secondsLeft} s</h3>
        </>
    );
}