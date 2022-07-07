const TEST_MODE = true; //Won't tweet, + lots of extra logs if true
const VERBOSE = false;
require('dotenv').config({ path: '.env-old' })
const {TwitterClient} = require('twitter-api-client')
const fs = require("fs")
const emoji = require('node-emoji')

const twitterClient = new TwitterClient({
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

const sendTweet = async (status) => {
  twitterClient.tweets.statusesUpdate({
      status: status
  }).then (response => {
      console.log("Tweeted!", response)
  }).catch(err => {
      console.error(err)
  })
}


//chord duration should never be less that

const randomEmojiString = (count) => {
  let output = "";
  for (var i = 0; i < count; i++) {
    output += emoji.random().emoji;
  }
  return output;
}

let dynamicEmojis = ["airplane","racing_car","horse_racing","running","turtle"].map(name => emoji.get(name));


const rand = (range) => Math.floor(Math.random()*range);

const lineBreak = "\n"

const noteNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const octatonicNotes = [0,1,3,4,6,7,9,10];

const maxAddedNotesInChord = 5;
const minNotesInChord = 1;
//it should look like a triangle
//first lower amt is 3

let MAX_REPEATS_EVER = 20;
let MAX_REPEATS = MAX_REPEATS_EVER;
let MIN_REPEATS = 3;
let MAX_NOTES_PER_CHORD = 6;
let MIN_CHORDS = 3;
let MAX_CHORDS = 10;

let TOTAL_CHORDS = MIN_CHORDS + rand(MAX_CHORDS - MIN_CHORDS + 1);
let NOTES_PER_CHORD = MAX_NOTES_PER_CHORD - 2 + rand(3);
//Create a line representing a chord.
//We need to know which chord of how many we're on, and whether to transpose.
const chord = (i,TOTAL_CHORDS,transpose) => {
  //Divide number of chords into percentage jumps.
  let octatonicLikelihood = (1/TOTAL_CHORDS)* i;
  //parabola, from Max - 0 over set of chords
  let maxRepeats = MIN_REPEATS + (MAX_REPEATS_EVER-MIN_REPEATS) * Math.pow(Math.E,-1*Math.pow(TOTAL_CHORDS,-1.5)*Math.pow(i,2));
  let repeats = Math.min(MAX_REPEATS,Math.max(MIN_REPEATS,Math.floor(maxRepeats/(1+Math.random()*.5))));//Math.max(1,MIN_REPEATS+rand(maxRepeats-MIN_REPEATS));//1 + rand(maxRepeats);
  MAX_REPEATS = repeats; //Next time, don't repeat any less than this time.
  TEST_MODE && VERBOSE && console.log(`NOTES_PER_CHORD: ${NOTES_PER_CHORD}, Chord ${i}: `,Math.floor(octatonicLikelihood*100)+"% octatonic, max repeats:",maxRepeats);
  let notes = [];
  let dynamic = Math.floor(((i)/TOTAL_CHORDS)*4);
  //Add unique notes to the chord until we have 3
  while(notes.length < NOTES_PER_CHORD){
    let note;
    //For each note, determine whether we will def add an octotonic or not.
    if(Math.random()<octatonicLikelihood){
      note = octatonicNotes[rand(octatonicNotes.length)];
    } else {
      //Otherwise, just pick a random note.
      note = rand(12);
    }
    //If the note is not already in the chord, add it.
    //Otherwise we'll try again next time.
    if(notes.indexOf(note) === -1){
      notes.push(note);
    }
  }
  //Next time, don't use any more notes than this time.
  NOTES_PER_CHORD = Math.max(1,Math.ceil(NOTES_PER_CHORD/(1+Math.random()*1.5)))
  if(transpose){
    notes = notes.map(n => n+1);
  }
  const namedNotes = notes.map(n => noteNames[n%noteNames.length]) // convert from numbers to letters
  TEST_MODE && VERBOSE && console.log(`Chord ${i}: `,notes,namedNotes,`\n`)
  return `${emoji.get("zap")} ${namedNotes.join(" ")} ${dynamicEmojis[dynamic]} ${emoji.get("repeat_one")} x${repeats}`; //${notes.map(n => noteNames[n])
}

const generateScore = () => {
  let transposeScore = Math.random() > .5;
  TEST_MODE && VERBOSE && console.log("\nInfo:")
  TEST_MODE && VERBOSE && transposeScore && console.log(`Transposing score!`)
  let chords = [];
  for (var i = 0; i < TOTAL_CHORDS; i++) {
    chords.push(chord(i,TOTAL_CHORDS-1,transposeScore));
  }
  let emojiCount = Math.floor(chords[0].length/2)
  return (

`${randomEmojiString(emojiCount)}
${emoji.get("fire").repeat(emojiCount-1)}
${chords.join(lineBreak)}
${emoji.get("cloud").repeat(3)}
${emoji.get("back").repeat(2)}
${randomEmojiString(1)}`

);
}

const init = async () => {
  let score = generateScore();
  TEST_MODE && console.log("Tweet:\n",score)
  if(!TEST_MODE){
    await sendTweet(score);
  }
}

init()
