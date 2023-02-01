const getUsers = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ status: false, message: "user is invalid" });

    let getData = await usermodle.findOne({ _id: userId });
    if (!getData)
      return res.status(404).send({ status: false, message: "user not found" });
    return res
      .status(200)
      .send({ status: true, message: "User profile details", data: getData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message});
  }
};
