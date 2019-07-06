export default async ({ firebase }) => {
  const dailyReadRef = firebase
    .firestore()
    .collection(process.env.REACT_APP_FIREBASE_DAYLY_USAGE_COLLECTION_NAME)
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
