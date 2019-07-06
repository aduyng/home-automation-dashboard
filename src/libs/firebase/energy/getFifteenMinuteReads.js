export default async ({ firebase, dailyUsageDoc, entryIterator }) => {
  const fifteenMinuteReadsRef = firebase
    .firestore()
    .collection(process.env.REACT_APP_FIREBASE_DAYLY_USAGE_COLLECTION_NAME)
    .doc(dailyUsageDoc.id)
    .collection(
      process.env.REACT_APP_FIREBASE_FIFTEEN_MINUTE_READ_COLLECTION_NAME
    );

  const dailyUfifteenMinuteReadsQS = await fifteenMinuteReadsRef.get();
  dailyUfifteenMinuteReadsQS.forEach(entryIterator);
};
