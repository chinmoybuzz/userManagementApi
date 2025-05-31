const userModel = require("../models/user.model");
const list = async (params) => {
  try {
    const { role } = params;

    let query = { deletedAt: null };

    if (role) {
      query["role"] = role;
    }
    console.log(query);
    const result = await userModel.aggregate([
      { $match: query },

      {
        $project: {
          _id: 1,
          email: 1,
          role: 1,
        },
      },
    ]);
    // const result = await userModel.aggregatePaginate(myAggregate);
    // console.log(result);

    return {
      status: 200,
      result,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Server Error",
    };
  }
};

const updateParentId = async (params) => {
  try {
    // console.log(params);
    const { userId, parentId } = params;

    if (!userId) {
      return {
        status: 400,
        message: "User ID is required",
      };
    }

    // Update the user's parentId
    const updatedUser = await userModel.findByIdAndUpdate(userId, { parentId: parentId || null }, { new: true }).select("-password -refreshTokens");

    if (!updatedUser) {
      return {
        status: 404,
        message: "User not found",
      };
    }

    return {
      status: 200,
      message: "Parent updated successfully",
      result: updatedUser,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: "Server Error",
    };
  }
};

const treeView = async (params) => {
  try {
    const { role } = params;
    if (!role || !["admin", "subadmin", "user"].includes(role)) {
      return {
        status: 400,
        message: "Invalid or missing role",
      };
    }

    let rootMatch = { deletedAt: null };

    if (role === "admin") {
      rootMatch.role = "admin";
      rootMatch.parentId = null;
    } else if (role === "subadmin") {
      rootMatch.role = "subadmin";
      // We'll filter subadmins whose parent is admin later in $graphLookup
    } else if (role === "user") {
      rootMatch.role = "user";
      // We'll filter users whose parent is subadmin later in $graphLookup
    }

    // Aggregation pipeline
    const result = await userModel.aggregate([
      { $match: rootMatch },
      {
        $graphLookup: {
          from: "users", // collection name in MongoDB is usually plural "users"
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "children",
          restrictSearchWithMatch: { deletedAt: null },
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          role: 1,
          children: {
            _id: 1,
            email: 1,
            role: 1,
            parentId: 1,
          },
        },
      },
    ]);

    function buildNestedTree(root, allChildren) {
      const children = allChildren.filter((c) => String(c.parentId) === String(root._id));
      return {
        id: root._id,
        email: root.email,
        role: root.role,
        children: children.map((child) => buildNestedTree(child, allChildren)),
      };
    }

    // Build trees for each root document
    const trees = result.map((rootUser) => buildNestedTree(rootUser, rootUser.children));

    return {
      status: 200,
      data: trees,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: "Server Error",
    };
  }
};

module.exports = { list, updateParentId, treeView };
