const HireRequest = require("../models/hireRequest");
const UserService = require("./userService");
const NotificationService = require("./notificationService");
const HttpMessage = require("../middlewares/HttpMessage");

class HireRequestService {
  async getHireRequestsForGuide(guideId) {
    try {
      const hireRequests = await HireRequest.find({ guide: guideId }).populate(
        "client"
      );
      return hireRequests; // Return only the clients who are requesting the hire
    } catch (error) {
      console.error("Error fetching hire requests for guide:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }

  async getHireRequestsForClient(clientId) {
    try {
      const hireRequests = await HireRequest.find({
        client: clientId,
      }).populate("guide");
      return hireRequests; // Return only the guides related to the client
    } catch (error) {
      console.error("Error fetching hire requests for client:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }

  async updateHireRequestStatus(hireRequestId, status) {
    if (!["pending", "accepted", "cancelled", "completed"].includes(status)) {
      throw HttpMessage.INVALID_STATUS;
    }

    try {
      // Find the hire request by ID
      const hireRequest = await HireRequest.findById(hireRequestId);
      if (!hireRequest) {
        throw HttpMessage.NOT_FOUND;
      }

      // Check if the client already has an accepted hire request
      const existingAcceptedRequest = await HireRequest.findOne({
        client: hireRequest.client,
        status: "accepted",
      });

      if (status === "accepted" && existingAcceptedRequest) {
        // Notify the guide that the client already has a hired guide
        await NotificationService.createNotification({
          userId: hireRequest.guide,
          message: "The client has already hired another guide.",
          type: "warning",
        });

        throw HttpMessage.ALREADY_HAS_GUIDE;
      }

      // Update the hire request status
      const updatedRequest = await HireRequest.findByIdAndUpdate(
        hireRequestId,
        { status },
        { new: true }
      );

      if (!updatedRequest) {
        throw HttpMessage.NOT_FOUND;
      }

      console.log("Updated hire request:", updatedRequest);

      // If status is accepted, update the guide's profile
      if (status === "accepted") {
        // Delete all other hire requests for the client that are NOT accepted
        await HireRequest.deleteMany({
          client: updatedRequest.client,
          status: { $ne: "accepted" },
        });
      }

      // Notify the client
      await NotificationService.createNotification({
        userId: updatedRequest.client,
        message: `Your hire request has been ${status}.`,
        type: "info",
      });

      await NotificationService.createNotification({
        userId: updatedRequest.guide,
        message: `The hire request has been ${status}.`,
        type: "info",
      });

      return updatedRequest;
    } catch (error) {
      console.error("Error updating hire request status:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }
}

module.exports = new HireRequestService();
