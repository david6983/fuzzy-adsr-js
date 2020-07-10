// fuzzy model initialisation

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

/**
 * Compute the precise output from the 4 fuzzy inputs given. The result is fixed to 1 decimal.
 *
 * @param values list of the 4 fuzzy input values
 * @returns {number} precise fuzzy output
 */
function computeTypeValue(values) {
    return parseFloat(sys.getPreciseOutput(values)[0].toFixed(1))
}

// simple test to see if the model is working compared the matlab model
// this assertion return an error message if the result is different

console.assert(
    computeTypeValue([48.09, 125, -7.008, 155.3]) === 2.5,
    'The system is not ready to work !'
)

// scale functions: the GUI of the envelope use a scale from 0 to 1, we need to scale the values

// 1 for 200 ms
function scaleAttack(value) {
    return value * 200
}

// 1 for 1000 ms
function scaleDecayOrRelease(value) {
    return value * 1000
}

// simple function to compute log10 in js
function log10(x) {
    return Math.log(x)/Math.LN10;
}

// the sustain is in decibel: we defined -40 as the minimum value because under this value, the value is -Infinity
// which is not a valid input for our model
// the input value is the gain between 0 and 1, we want to compute the gain in dB by using the formula
// GdB = 20 * log10(value)
function scaleSustain(value) {
    let scaled = 20 * log10(value)
    return scaled >= -40.0 ? scaled : -40.0 // seil the value to be -40
}

// The GUI is based on https://jsfiddle.net/bc_rikko/75k8toud/ which use the framework vue js (https://vuejs.org/)
//
const EnvelopeGenerator = Vue.component('envelope-generator', {
    name: 'EnvelopeGenerator',
    template: "#adsr", // use the svg as template
    props: { // get the properties from the HTML template and define each value as Numbers and default values
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
            validator: v => 0 <= v && v <= 1 // this is to verify that the input is between 0 and 1 only
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
    data () { // all the data of our envelope are contained here
        return {
            path: '', // final path to draw in the svg template
            sharpness: 0.0 // sharpness value compute at each draw
        }
    },
    mounted() { // when the component is first drown
        this.draw(); // draw the default path
        this.computeSharpness(); // compute the sharpness value
    },
    watch: { // when the user move the slider, some functions need to be called
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
            // svg ratio
            const wRetio = this.width / 4;
            const hRetio = this.height / 1;

            const paths = []; // list of points
            let x, y;
            x = y = 0; // origin of the graph

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
            // give to the function computeTypeValue a list of the 4 inputs given from the sliders and already scaled
            let result = computeTypeValue([scaleAttack(this.attack),
                scaleDecayOrRelease(this.decay),
                scaleSustain(this.sustain),
                scaleDecayOrRelease(this.release)])
            // save the result
            this.sharpness = result
            // send the value to the parent component to be displayed later
            this.$emit('envelope-sharpness', this.sharpness)
        }
    }
});

// parent component
new Vue({
    el: '#app',
    components: { EnvelopeGenerator }, // the envelope component is a child of this component
    data() {
        return {
            form: { // form data
                attackTime: 0.5,
                decayTime: 0.3,
                sustainLevel: 0.5,
                releaseTime: 1.0
            },
            ctx: new AudioContext(), // audio context to provide sound output
            osc: null,
            adsr: null,
            sharpness: 'unknown', // sharpness value to display
            type: 'unknown' // BONUS: type to display according to the sharpness value
        }
    },

    methods: {
        start() { // handle the 'start' button
            this.osc = this.ctx.createOscillator(); // create a sine wave to play through the speaker
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
        stop() { // handle the 'stop' button
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
        // callback function for the child component to send the value back to the parent component
        getSharpness(sharpness) {
            this.sharpness = sharpness
        }
    }
});