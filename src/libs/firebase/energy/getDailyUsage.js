export default async ({ firebase, config }) => {
  const dailyReadRef = firebase
    .firestore()
    .collection(config.firestoreDailyUsageCollectionName)
    .orderBy("date", "desc")
    .limit(1);

  const dailyUsageQS = await dailyReadRef.get();
  let dailyUsageDoc;
  dailyUsageQS.forEach(function(doc) {
    dailyUsageDoc = doc;
    return false;
  });
  return dailyUsageDoc;
};
