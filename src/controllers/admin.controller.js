const {
  updateHotspotAttributes,
  getAllHotspots,
  getAllUserdata,
} = require('../helpers/modifyXML');

const updateLot = async (req, res) => {
  const { lotId, status = true, description, info } = req.body;

  if (!lotId) {
    return res.status(400).json({
      message: 'lotId is required',
    });
  }
  try {
    const error = await updateHotspotAttributes(lotId, status, description, info);

    if (error) {
      return res.status(400).json({ message: error });
    }

    res.status(200).json({
      message: 'Lot updated',
    });
  } catch (err) {
    console.log(err);
  }
};

const getLots = async (req, res) => {
  try {
    let hotspots = await getAllHotspots();
    const InfoLote = await getAllUserdata();

    hotspots = hotspots.map((hotspot) => {
      hotspot = {
        ...hotspot,
        info: InfoLote.filter((lote) => hotspot.id === lote.customnodeid)[0],
      };
      return hotspot;
    });

    res.status(200).json({ hotspots });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { updateLot, getLots };
