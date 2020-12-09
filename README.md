# Fuzzy ADSR classifier

## Prerequisite

- a recent web browser
- an internet connection

## Run the app

```
double click on index.html to launch the HTML view
```

## Abstract

In electronic music composition, virtual synthesizer plugins are helpful to design some unique sounds. 
Lot of composer use pre-designed sounds that can be saved and distributed as presets inside virtual plugins. 
But most of the time when musicians search a sound, they need to use additional information already inserted by hand. 
This new approach uses the ADSR envelope of a sound to compute a new feature characteristic called sharpness. 
By using fuzzy logic, we can enable plugin manufacturers to create appropriate rules to compute the sharpness from 
the envelope of the sound in virtual synthesizers to better organize and find a sound rapidly by sharpness. 
This fuzzy logic system gives some good results to compute this sharpness feature. Fuzzy logic could help developers 
to implement this simple solution in their softwares without taking too much time computation.

## Proposal

Most of the time, a lot of those virtual softwares do not provide preset filters that have been computed automatically. 
In fact, the user is only able to fill up additional information such as the category: lead, bass, percussion, pluck. 
But what if we could filter these presets by one feature that could be computed from sound parameter values?
In this project, I’ve experimented to compute this kind of parameter by using the envelope of a sound called ADSR envelope: 
In a nutshell, it consists of 4 parameters which are Attack, Decay, Sustain, Release. This envelope represents the shape of the sound. 
For example, a short attack (in millisec- ond) makes the sound sharper. Otherwise, if the sound has a long attack or a long release the sound is smooth.
We can see that if we apply some rules from the 4 parameter values, we can easily apply a fuzzy logic system on the envelope.

## Merit

The main benefit of this idea is to provide an intelligent filtering system that detects the sharpness of a sound. We
can easily have a computed category that can be useful for presets management in virtual plugins. Moreover, it can be a 
huge improvement in terms of workflow when searching for a specific sound based on this characteristic. For instance, 
I want a sound that is really sharp in order to tweak different parameters to create a snappy lead for my melody in a song. 
By using this feature, I can filter by sharpness all my presets or create a new ADSR envelope from an initial sound.

## Results

By testing the prototype we can see that the results corre- spond to the Matlab design. But we can see that the system 
does not exploit at 100% the range of the output value. This is due to the low number of rules used. Perhaps I should 
add new rules by finding new shapes.
One other issue is that the sharpness is the same for a bass and a lead. So we are unable to distinguish their sharpness. 
Is it a good solution to separate them? Some further experi- mentations need to be performed with other musicians to see how 
effective the system is.

## Future perspective

Concerning the target users, sound designers or music pro- ducers (composers) can easily filter audio samples or virtual 
synthesizer presets using this new feature. It can become a huge benefit for the workflow to search the perfect sound 
and add it in a song without necessarily hearing it.

The next step of this experimentation will be to develop a c++ prototype using the JUCE framework that provides tools to 
create an audio plugin for digital audio workstation. The goal will be to see how effective the method is and How it 
affect the audio processor part (thread).

In addition I should definetely define some new rules to have a better accuracy in term of sharpness. 
In other words exploit more the range of the output value.

oreover, I should also add some new test cases in the code to make sure the implementation is correct for more than one case.

## References

[1] DrewSwisher,D.S.(n.d.).ADSR:THEBESTKEPTSECRETOFPRO MUSIC PRODUCERS! Musicianonmission.com Retrieved July 16, 2020, from https://www.musicianonamission.com/adsr

[2] bc_rikko. (n.d.). Envelope generator(ADSR) with Web Audio API + Vue.js. Jsfiddle. from https://jsfiddle.net/bc_rikko/75k8toud/
