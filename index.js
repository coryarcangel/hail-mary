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

//Set this to true to get helpful logs!
const TEST_MODE = true;

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
  TEST_MODE && console.log(`Octatonic likelihood for chord ${i}: `,octatonicLikelihood)
  let repeats = 1 + rand((10 * octatonicLikelihood));
  TEST_MODE && console.log(`Max repeats for chord ${i}: `,repeats)
  let notes = [];
  //Add unique notes to the chord until we have 3
  while(notes.length < 3){
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
  TEST_MODE && console.log(`Notes in chord ${i}: `,notes)
  notes = notes.map(n => noteNames[n%noteNames.length]) // convert from numbers to letters
  TEST_MODE && console.log(`Note names in chord ${i}: `,notes)
  return `${emoji.get("zap")} ${notes.join(" ")} x ${repeats}`; //${notes.map(n => noteNames[n])
}

const generateScore = () => {
  let totalChords = 3 + rand(8)
  let transposeScore = Math.random() > .5;
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

const sendTweet = async (status) => {
  twitterClient.tweets.statusesUpdate({
      status: status
  }).then (response => {
      console.log("Tweeted!", response)
  }).catch(err => {
      console.error(err)
  })
}

const init = async () => {
  let score = generateScore();
  console.log(score)
  let tweetResult = await sendTweet(score);
}

init()
