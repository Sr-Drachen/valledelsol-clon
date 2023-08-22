const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
// const { decode } = require('html-entities');

const xmlFilePath = path.join(__dirname, '../../public/pano.xml');

const getData = async () => {
  try {
    const data = await fs.promises.readFile(xmlFilePath, 'utf-8');
    const result = await xml2js.parseStringPromise(data);
    return result;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

const updateHotspotAttributes = async (hotspotId, status, description, newInfo) => {
  try {
    const result = await getData();
    const hotspot = result.tour.panorama[0].hotspots[0].hotspot.find(
      (h) => h.$.id.toLowerCase() === hotspotId
    );
    const { userdata } = result.tour.panorama.find(
      ({ userdata }) => userdata[0].$.customnodeid === hotspotId
    );

    if (hotspot && userdata) {
      // hotspot.$.title = newTitle.length !== 0 ? newTitle : hotspot.$.title;
      hotspot.$.skinid = status ? 'ht_disponible' : 'ht_noDisponible';
      userdata[0].$.tags = status ? 'mostrar' : 'mostrar|nodisponible';
      userdata[0].$.description = description;
      userdata[0].$.info = newInfo;
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);
      await fs.promises.writeFile(xmlFilePath, xml);
      console.log('File updated correctly');
    } else {
      throw new Error(`No hotspot found with the id: ${hotspotId}`);
    }
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

const getAllHotspots = async () => {
  try {
    const result = await getData();

    const hotspots = result.tour.panorama[0].hotspots[0].hotspot;

    const hotspotArray = hotspots
      .filter(
        (hotspot) =>
          hotspot.$.id &&
          hotspot.$.tilt &&
          hotspot.$.url &&
          hotspot.$.skinid &&
          hotspot.$.title &&
          hotspot.$.pan
      )
      .map((hotspot) => {
        return {
          id: hotspot.$.id,
          tilt: hotspot.$.tilt,
          url: hotspot.$.url,
          skinid: hotspot.$.skinid,
          title: hotspot.$.title,
          pan: hotspot.$.pan,
        };
      })
      .sort((a, b) => +a.title - +b.title);

    return hotspotArray;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

// const updateHotspotSkin = async (hotspotId, status) => {
//   try {
//     const result = await getData();
//     const hotspot = result.tour.panorama[0].hotspots[0].hotspot
//       .filter(
//         (hotspot) =>
//           hotspot.$.id &&
//           hotspot.$.tilt &&
//           hotspot.$.url &&
//           hotspot.$.skinid &&
//           hotspot.$.title &&
//           hotspot.$.pan
//       )
//       .find((h) => h.$.id === hotspotId);
//     if (hotspot) {
//       hotspot.$.skinid = status ? 'ht_disponible' : 'ht_noDisponible';
//       const builder = new xml2js.Builder();
//       const xml = builder.buildObject(result);
//       await fs.promises.writeFile(xmlFilePath, xml);
//       console.log('File updated correctly');
//     } else {
//       throw new Error(`No hotspot found with the id: ${hotspotId}`);
//     }
//   } catch (error) {
//     console.error(error);
//     return error.message;
//   }
// };

const getAllUserdata = async () => {
  try {
    const result = await getData();

    const userDataArray = result.tour.panorama.map(({ userdata }) => {
      return {
        source: userdata[0].$.source,
        comment: userdata[0].$.comment,
        nodeid: userdata[0].$.nodeid,
        author: userdata[0].$.author,
        copyright: userdata[0].$.copyright,
        longitude: userdata[0].$.longitude,
        datetime: userdata[0].$.datetime,
        customnodeid: userdata[0].$.customnodeid,
        tags: userdata[0].$.tags,
        latitude: userdata[0].$.latitude,
        title: userdata[0].$.title,
        info: userdata[0].$.info,
        description: userdata[0].$.description,
      };
    });
    return userDataArray;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

module.exports = {
  updateHotspotAttributes,
  getAllHotspots,
  getAllUserdata,
};
