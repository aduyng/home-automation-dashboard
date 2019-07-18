export default async ({ firebase, config, dailyUsageDoc, entryIterator }) => {
  const fifteenMinuteReadsRef = firebase
    .firestore()
    .collection(config.firestoreDailyUsageCollectionName)
    .doc(dailyUsageDoc.id)
    .collection(
      config.firestoreFifteenMinuteReadsCollectionName
    );

  const dailyUfifteenMinuteReadsQS = await fifteenMinuteReadsRef.get();
  dailyUfifteenMinuteReadsQS.forEach(entryIterator);
};
