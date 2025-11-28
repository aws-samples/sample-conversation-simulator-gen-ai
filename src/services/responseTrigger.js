

const responseTrigger = (transcript) => {
    var lowercase = transcript.toLowerCase()
    var triggers = {
        farewells: ['bye', 'goodbye'],
        inquiries: ['why', '?'],
        // Add more triggers and associated words
      }

    for (const trigger in triggers) {
        const triggerWords = triggers[trigger];
        if (triggerWords.some(word => lowercase.includes(word))) {
          console.log(lowercase)
          console.log(triggers[trigger])
          return true;
        }
      }
    return false
}

export default responseTrigger;