// fuzzy model

const sys = new fuzzyis.FIS("fuzzy_adsr")

// fuzzy output

const TYPE = new fuzzyis.LinguisticVariable('type', [0, 10])
sys.addOutput(TYPE)

// fuzzy inputs
const ATTACK = new fuzzyis.LinguisticVariable('attack', [0, 200])
const DECAY = new fuzzyis.LinguisticVariable('decay', [0, 1000])
const SUSTAIN = new fuzzyis.LinguisticVariable('sustain', [-40, 0])
const RELEASE = new fuzzyis.LinguisticVariable('release', [0, 1000])

sys.addInput(ATTACK)
sys.addInput(DECAY)
sys.addInput(SUSTAIN)
sys.addInput(RELEASE)

// memberships functions

ATTACK.addTerm(new fuzzyis.Term('fast', 'triangle', [-83.31, 0, 83.31]));
ATTACK.addTerm(new fuzzyis.Term('medium', 'triangle',  [17.08, 100.4, 183.7]));
ATTACK.addTerm(new fuzzyis.Term('slow', 'triangle',  [116.7, 200, 283.3]));

DECAY.addTerm(new fuzzyis.Term('short', 'triangle',  [-416.5, 0, 416.5]));
DECAY.addTerm(new fuzzyis.Term('medium', 'triangle',  [83.35, 500, 916.5]));
DECAY.addTerm(new fuzzyis.Term('long', 'triangle',  [583.5, 1000, 1416]));

SUSTAIN.addTerm(new fuzzyis.Term('low', 'triangle',  [-70.83, -50, -29.17]));
SUSTAIN.addTerm(new fuzzyis.Term('medium', 'triangle',  [-45.83, -25, -4.175]));
SUSTAIN.addTerm(new fuzzyis.Term('hight', 'triangle',  [-20.82, 0, 20.83]));

RELEASE.addTerm(new fuzzyis.Term('short', 'triangle',  [-416.5, 0, 416.5]));
RELEASE.addTerm(new fuzzyis.Term('medium', 'triangle',  [83.35, 500, 916.5]));
RELEASE.addTerm(new fuzzyis.Term('long', 'triangle',  [583.5, 1000, 1416]));

TYPE.addTerm(new fuzzyis.Term('pad', 'triangle',  [-2.5, -2.776e-17, 2.5]));
TYPE.addTerm(new fuzzyis.Term('keyboard', 'triangle',  [0, 2.5, 5]));
TYPE.addTerm(new fuzzyis.Term('perc', 'triangle',  [2.5, 5, 7.5]));
TYPE.addTerm(new fuzzyis.Term('bass_lead', 'triangle',  [5, 7.5, 10]));
TYPE.addTerm(new fuzzyis.Term('pluck', 'triangle',  [7.5, 10, 12.5],));

// rules

sys.rules = [
    new fuzzyis.Rule(
        ['fast', 'long', 'hight', 'long'],
        ['pad'],
        'and'
    ),
    new fuzzyis.Rule(
        ['medium', 'short', 'medium', 'short'],
        ['keyboard'],
        'and'
    ),
    new fuzzyis.Rule(
        ['slow', 'short', 'medium', 'short'],
        ['keyboard'],
        'and'
    ),
    new fuzzyis.Rule(
        ['slow', 'medium', 'low', 'short'],
        ['perc'],
        'and'
    ),
    new fuzzyis.Rule(
        ['slow', 'medium', 'hight', 'short'],
        ['bass_lead'],
        'and'
    ),
    new fuzzyis.Rule(
        ['slow', 'short', 'low', 'short'],
        ['pluck'],
        'and'
    ),
];

function computeTypeValue(values) {
    return parseFloat(sys.getPreciseOutput(values)[0].toFixed(1))
}

// simple test

console.assert(
    computeTypeValue([48.09, 125, -7.008, 155.3]) === 2.5,
    'The system is not ready to work !'
)

// scale function

function scaleAttack(value) {
    return value * 200
}

function scaleDecayOrRelease(value) {
    return value * 1000
}

function log10(x) {
    return Math.log(x)/Math.LN10;
}

function scaleSustain(value) {
    let scaled = 20 * log10(value)
    return scaled >= -40.0 ? scaled : -40.0
}

const EnvelopeGenerator = Vue.component('envelope-generator', {
    name: 'EnvelopeGenerator',
    template: "#adsr",
    props: {
        width: {
            type: Number,
            default: 640
        },
        height: {
            type: Number,
            default: 480
        },
        attack: {
            type: Number,
            required: true,
            validator: v => 0 <= v && v <= 1
        },
        decay: {
            type: Number,
            required: true,
            validator: v => 0 <= v && v <= 1
        },
        sustain: {
            type: Number,
            required: true,
            validator: v => 0 <= v && v <= 1
        },
        release: {
            type: Number,
            required: true,
            validator: v => 0 <= v && v <= 1
        }
    },
    data () {
        return {
            path: '',
            sharpness: 0.0
        }
    },
    mounted() {
        this.draw();
        this.computeSharpness();
    },
    watch: {
        attack: function () {
            this.draw();
            this.computeSharpness();
        },
        decay: function () {
            this.draw();
            this.computeSharpness();
        },
        sustain: function () {
            this.draw();
            this.computeSharpness();
        },
        release: function () {
            this.draw();
            this.computeSharpness();
        }
    },
    methods: {
        draw() {
            const wRetio = this.width / 4;
            const hRetio = this.height / 1;

            const paths = [];
            let x, y;
            x = y = 0;

            // attack
            x = this.attack * wRetio;
            y = 0;
            paths.push(`${x} ${y}`);

            // decay
            x += this.decay * wRetio;
            y = this.height - this.sustain * hRetio;
            paths.push(`${x} ${y}`);

            // sustain
            x += 1 * wRetio;
            paths.push(`${x} ${y}`);

            // release
            x += this.release * wRetio;
            y = this.height;
            paths.push(`${x} ${y}`);

            this.path = `M0 ${this.height},` + paths.join(',');
        },
        computeSharpness() {
            let result = computeTypeValue([scaleAttack(this.attack),
                scaleDecayOrRelease(this.decay),
                scaleSustain(this.sustain),
                scaleDecayOrRelease(this.release)])
            this.sharpness = result
            this.$emit('envelope-sharpness', this.sharpness)
        }
    }
});

new Vue({
    el: '#app',
    components: { EnvelopeGenerator },
    data() {
        return {
            form: {
                attackTime: 0.5,
                decayTime: 0.3,
                sustainLevel: 0.5,
                releaseTime: 1.0
            },
            ctx: new AudioContext(),
            osc: null,
            adsr: null,
            sharpness: 'unknown',
            type: 'unknown'
        }
    },

    methods: {
        start() {
            this.osc = this.ctx.createOscillator();
            this.adsr = this.ctx.createGain();

            // osc -> gain -> output
            this.osc.connect(this.adsr);
            this.adsr.connect(this.ctx.destination);

            const t0 = this.ctx.currentTime;
            this.osc.start(t0);
            // vol:0
            this.adsr.gain.setValueAtTime(0, t0);
            // attack
            const t1 = t0 + this.form.attackTime;
            this.adsr.gain.linearRampToValueAtTime(1, t1);
            // decay
            const t2 = this.form.decayTime;
            this.adsr.gain.setTargetAtTime(this.form.sustainLevel, t1, t2);
        },
        stop() {
            const t = this.ctx.currentTime;
            this.adsr.gain.cancelScheduledValues(t);
            this.adsr.gain.setValueAtTime(this.adsr.gain.value, t);
            this.adsr.gain.setTargetAtTime(0, t, this.form.releaseTime);

            const stop = setInterval(() => {
                if (this.adsr.gain.value < 0.01) {
                    this.osc.stop();
                    clearInterval(stop);
                }
            }, 10);
        },
        getSharpness(sharpness) {
            this.sharpness = sharpness
        }
    }
});