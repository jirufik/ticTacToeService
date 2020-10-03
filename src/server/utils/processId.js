export default function processId({arrayOfObjects}) {

  return arrayOfObjects.map(el => {
    const id = el._id;
    el.id = id;
    delete el._id;
    return el;
  });

}
