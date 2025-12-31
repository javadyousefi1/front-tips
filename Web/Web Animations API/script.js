// ====================================
// Demo 1: Basic Fade & Slide
// ====================================

const box1 = document.getElementById('box1');
const fadeInBtn = document.getElementById('fadeIn');
const slideInBtn = document.getElementById('slideIn');
const fadeSlideBtn = document.getElementById('fadeSlide');
const reset1Btn = document.getElementById('reset1');

fadeInBtn.addEventListener('click', () => {
    box1.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {
        duration: 800,
        easing: 'ease-out',
        fill: 'forwards'
    });
});

slideInBtn.addEventListener('click', () => {
    box1.animate([
        { transform: 'translateX(-100px)' },
        { transform: 'translateX(0px)' }
    ], {
        duration: 600,
        easing: 'ease-out',
        fill: 'backwards'
    });
});

fadeSlideBtn.addEventListener('click', () => {
    box1.animate([
        {
            opacity: 0,
            transform: 'translateY(-50px)'
        },
        {
            opacity: 1,
            transform: 'translateY(0px)'
        }
    ], {
        duration: 800,
        easing: 'ease-out',
        fill: 'forwards'
    });
});

reset1Btn.addEventListener('click', () => {
    box1.animate([
        { opacity: box1.style.opacity || 1 },
        { opacity: 1 }
    ], {
        duration: 0,
        fill: 'forwards'
    });

    box1.animate([
        { transform: window.getComputedStyle(box1).transform },
        { transform: 'none' }
    ], {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
    });
});

// ====================================
// Demo 2: Bounce & Elastic Effects
// ====================================

const box2 = document.getElementById('box2');
const bounceBtn = document.getElementById('bounce');
const shakeBtn = document.getElementById('shake');
const pulseBtn = document.getElementById('pulse');
const flipBtn = document.getElementById('flip');

bounceBtn.addEventListener('click', () => {
    box2.animate([
        { transform: 'scale(1) translateY(0px)' },
        { transform: 'scale(1.2) translateY(-20px)', offset: 0.3 },
        { transform: 'scale(0.9) translateY(0px)', offset: 0.5 },
        { transform: 'scale(1.05) translateY(-10px)', offset: 0.7 },
        { transform: 'scale(1) translateY(0px)' }
    ], {
        duration: 800,
        easing: 'ease-in-out'
    });
});

shakeBtn.addEventListener('click', () => {
    box2.animate([
        { transform: 'translateX(0px)' },
        { transform: 'translateX(-15px)' },
        { transform: 'translateX(15px)' },
        { transform: 'translateX(-15px)' },
        { transform: 'translateX(15px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0px)' }
    ], {
        duration: 500,
        easing: 'ease-in-out'
    });
});

pulseBtn.addEventListener('click', () => {
    box2.animate([
        { transform: 'scale(1)', boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)' },
        { transform: 'scale(1.1)', boxShadow: '0 10px 30px rgba(102, 126, 234, 0.6)' },
        { transform: 'scale(1)', boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)' }
    ], {
        duration: 600,
        iterations: 2,
        easing: 'ease-in-out'
    });
});

flipBtn.addEventListener('click', () => {
    box2.animate([
        { transform: 'rotateY(0deg)' },
        { transform: 'rotateY(180deg)' },
        { transform: 'rotateY(360deg)' }
    ], {
        duration: 1000,
        easing: 'ease-in-out'
    });
});

// ====================================
// Demo 3: Continuous Animations
// ====================================

const spinner = document.getElementById('spinner');
const floatBox = document.getElementById('floatBox');
const pulseRing = document.getElementById('pulseRing');
const startSpinnerBtn = document.getElementById('startSpinner');
const stopSpinnerBtn = document.getElementById('stopSpinner');
const startFloatBtn = document.getElementById('startFloat');
const stopFloatBtn = document.getElementById('stopFloat');

let spinnerAnimation = null;
let floatAnimation = null;
let pulseAnimation = null;

// Start pulse ring immediately
pulseAnimation = pulseRing.animate([
    { transform: 'scale(1)', opacity: 0.8 },
    { transform: 'scale(2)', opacity: 0 }
], {
    duration: 2000,
    iterations: Infinity,
    easing: 'ease-out'
});

startSpinnerBtn.addEventListener('click', () => {
    if (!spinnerAnimation || spinnerAnimation.playState === 'finished') {
        spinnerAnimation = spinner.animate([
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' }
        ], {
            duration: 2000,
            iterations: Infinity,
            easing: 'linear'
        });
    }
});

stopSpinnerBtn.addEventListener('click', () => {
    if (spinnerAnimation) {
        spinnerAnimation.cancel();
    }
});

startFloatBtn.addEventListener('click', () => {
    if (!floatAnimation || floatAnimation.playState === 'finished') {
        floatAnimation = floatBox.animate([
            { transform: 'translateY(0px)' },
            { transform: 'translateY(-20px)' },
            { transform: 'translateY(0px)' }
        ], {
            duration: 3000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
    }
});

stopFloatBtn.addEventListener('click', () => {
    if (floatAnimation) {
        floatAnimation.cancel();
    }
});

// ====================================
// Demo 4: Playback Control
// ====================================

const box4 = document.getElementById('box4');
const playBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const reverseBtn = document.getElementById('reverse');
const fasterBtn = document.getElementById('faster');
const slowerBtn = document.getElementById('slower');
const finishBtn = document.getElementById('finish');
const playStateEl = document.getElementById('playState');
const progressEl = document.getElementById('progress');
const speedEl = document.getElementById('speed');

let controlledAnimation = null;

function createControlledAnimation() {
    controlledAnimation = box4.animate([
        {
            transform: 'translateX(0px) rotate(0deg) scale(1)',
            backgroundColor: '#667eea'
        },
        {
            transform: 'translateX(300px) rotate(360deg) scale(1.2)',
            backgroundColor: '#764ba2'
        }
    ], {
        duration: 3000,
        easing: 'ease-in-out',
        fill: 'both'
    });

    controlledAnimation.pause();

    // Update UI
    function updateUI() {
        playStateEl.textContent = controlledAnimation.playState;

        const duration = controlledAnimation.effect.getTiming().duration;
        const current = controlledAnimation.currentTime || 0;
        const progress = Math.min((current / duration) * 100, 100);
        progressEl.textContent = Math.round(progress) + '%';

        speedEl.textContent = controlledAnimation.playbackRate + 'x';

        if (controlledAnimation.playState !== 'finished') {
            requestAnimationFrame(updateUI);
        }
    }

    requestAnimationFrame(updateUI);

    controlledAnimation.onfinish = () => {
        playStateEl.textContent = 'finished';
        progressEl.textContent = '100%';
    };
}

playBtn.addEventListener('click', () => {
    if (!controlledAnimation || controlledAnimation.playState === 'finished') {
        createControlledAnimation();
    }
    controlledAnimation.play();
});

pauseBtn.addEventListener('click', () => {
    if (controlledAnimation) {
        controlledAnimation.pause();
    }
});

reverseBtn.addEventListener('click', () => {
    if (controlledAnimation) {
        controlledAnimation.reverse();
    } else {
        createControlledAnimation();
        controlledAnimation.reverse();
    }
});

fasterBtn.addEventListener('click', () => {
    if (!controlledAnimation) {
        createControlledAnimation();
    }
    controlledAnimation.playbackRate = 2;
});

slowerBtn.addEventListener('click', () => {
    if (!controlledAnimation) {
        createControlledAnimation();
    }
    controlledAnimation.playbackRate = 0.5;
});

finishBtn.addEventListener('click', () => {
    if (controlledAnimation) {
        controlledAnimation.finish();
    }
});

// ====================================
// Demo 5: Animation Sequences
// ====================================

const seq1 = document.getElementById('seq1');
const seq2 = document.getElementById('seq2');
const seq3 = document.getElementById('seq3');
const runSequenceBtn = document.getElementById('runSequence');
const runStaggerBtn = document.getElementById('runStagger');
const resetSequenceBtn = document.getElementById('resetSequence');

const sequenceKeyframes = [
    {
        opacity: 0,
        transform: 'translateY(-30px) scale(0.5)'
    },
    {
        opacity: 1,
        transform: 'translateY(0px) scale(1)'
    }
];

const sequenceOptions = {
    duration: 500,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fill: 'forwards'
};

runSequenceBtn.addEventListener('click', async () => {
    runSequenceBtn.disabled = true;

    // Reset first
    [seq1, seq2, seq3].forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-30px) scale(0.5)';
    });

    // Run sequence
    await seq1.animate(sequenceKeyframes, sequenceOptions).finished;
    await seq2.animate(sequenceKeyframes, sequenceOptions).finished;
    await seq3.animate(sequenceKeyframes, sequenceOptions).finished;

    runSequenceBtn.disabled = false;
});

runStaggerBtn.addEventListener('click', () => {
    runStaggerBtn.disabled = true;

    // Reset first
    [seq1, seq2, seq3].forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-30px) scale(0.5)';
    });

    // Stagger animation
    [seq1, seq2, seq3].forEach((el, index) => {
        const staggerDelay = index * 150;

        el.animate(sequenceKeyframes, {
            ...sequenceOptions,
            delay: staggerDelay
        });
    });

    setTimeout(() => {
        runStaggerBtn.disabled = false;
    }, 500 + 150 * 3);
});

resetSequenceBtn.addEventListener('click', () => {
    [seq1, seq2, seq3].forEach(el => {
        el.animate([
            {
                opacity: parseFloat(window.getComputedStyle(el).opacity),
                transform: window.getComputedStyle(el).transform
            },
            {
                opacity: 0,
                transform: 'translateY(-30px) scale(0.5)'
            }
        ], {
            duration: 300,
            fill: 'forwards'
        });
    });
});

// ====================================
// Demo 6: Complex Multi-Property
// ====================================

const card3d = document.getElementById('card3d');
const flipCardBtn = document.getElementById('flipCard');
const morphCardBtn = document.getElementById('morphCard');
const glowCardBtn = document.getElementById('glowCard');

flipCardBtn.addEventListener('click', () => {
    card3d.animate([
        {
            transform: 'perspective(1000px) rotateY(0deg)',
            opacity: 1
        },
        {
            transform: 'perspective(1000px) rotateY(90deg)',
            opacity: 0.5,
            offset: 0.5
        },
        {
            transform: 'perspective(1000px) rotateY(180deg)',
            opacity: 1
        }
    ], {
        duration: 1000,
        easing: 'ease-in-out'
    });
});

morphCardBtn.addEventListener('click', () => {
    card3d.animate([
        {
            borderRadius: '15px',
            transform: 'scale(1) rotate(0deg)',
            backgroundColor: '#ffffff'
        },
        {
            borderRadius: '50%',
            transform: 'scale(0.8) rotate(180deg)',
            backgroundColor: '#667eea',
            offset: 0.5
        },
        {
            borderRadius: '15px',
            transform: 'scale(1) rotate(360deg)',
            backgroundColor: '#ffffff'
        }
    ], {
        duration: 1500,
        easing: 'ease-in-out'
    });
});

glowCardBtn.addEventListener('click', () => {
    card3d.animate([
        {
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            filter: 'brightness(1) blur(0px)',
            transform: 'scale(1)'
        },
        {
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.6), 0 0 40px rgba(102, 126, 234, 0.4)',
            filter: 'brightness(1.2) blur(0px)',
            transform: 'scale(1.05)',
            offset: 0.5
        },
        {
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            filter: 'brightness(1) blur(0px)',
            transform: 'scale(1)'
        }
    ], {
        duration: 1200,
        easing: 'ease-in-out',
        iterations: 2
    });
});

// ====================================
// Interactive: Click box2 to bounce
// ====================================

box2.addEventListener('click', () => {
    box2.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(0.9)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
});

// ====================================
// Console helpers
// ====================================

console.log('✓ Web Animations API demos loaded!');
console.log('💡 Try the interactive demos above');
console.log('');
console.log('Quick example:');
console.log("document.querySelector('.demo-card').animate([");
console.log("  { transform: 'scale(1)' },");
console.log("  { transform: 'scale(1.1)' },");
console.log("  { transform: 'scale(1)' }");
console.log("], { duration: 500 });");

// ====================================
// Cleanup on page unload
// ====================================

window.addEventListener('beforeunload', () => {
    [spinnerAnimation, floatAnimation, pulseAnimation, controlledAnimation]
        .forEach(anim => {
            if (anim) anim.cancel();
        });
});
