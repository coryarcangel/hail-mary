require('dotenv').config()
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

const TEST_MODE = false; //Won't tweet, + lots of extra logs if true
const TOTAL_MAX_REPEATS = 10;
const NOTES_PER_CHORD = 3;
const MIN_CHORDS = 3;
const MAX_CHORDS = 10;

const randomEmojiString = (count) => {
  let output = "";
  for (var i = 0; i < count; i++) {
    output += emoji.random().emoji;
  }
  return output;
}

const rand = (range) => Math.floor(Math.random()*range);

const lineBreak = "\n"

const noteNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const octatonicNotes = [0,1,3,4,6,7,9,10];

//Create a line representing a chord.
//We need to know which chord of how many we're on, and whether to transpose.
const chord = (i,totalChords,transpose) => {
  //Divide number of chords into percentage jumps.
  let octatonicLikelihood = (1/totalChords)* i;
  let maxRepeats = TOTAL_MAX_REPEATS * octatonicLikelihood;
  //likelihood of 1 at first is 100%, and likelihood of 10/100 at end is 100%
  let repeats = 1 + rand(maxRepeats);
  TEST_MODE && console.log(`Chord ${i}: `,Math.floor(octatonicLikelihood*100)+"% octatonic, max repeats:",maxRepeats);
  let notes = [];
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
  if(transpose){
    notes = notes.map(n => n+1);
  }
  const namedNotes = notes.map(n => noteNames[n%noteNames.length]) // convert from numbers to letters
  TEST_MODE && console.log(`Chord ${i}: `,notes,namedNotes,`\n`)
  return `${emoji.get("zap")} ${namedNotes.join(" ")} x ${repeats}`; //${notes.map(n => noteNames[n])
}

const generateScore = () => {
  let totalChords = MIN_CHORDS + rand(MAX_CHORDS - MIN_CHORDS + 1)
  let transposeScore = Math.random() > .5;
  TEST_MODE && console.log("\nInfo:")
  TEST_MODE && transposeScore && console.log(`Transposing score!`)
  let chords = [];
  for (var i = 0; i < totalChords; i++) {
    chords.push(chord(i,totalChords-1,transposeScore));
  }
  return (

`${randomEmojiString(6)}
${emoji.get("fire").repeat(6)}
${chords.join(lineBreak)}
${emoji.get("cloud").repeat(6)}
${emoji.get("back").repeat(6)}
${randomEmojiString(6)}`

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
