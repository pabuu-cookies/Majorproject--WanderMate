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
      // Find the hire request by ID and update the status
      const updatedRequest = await HireRequest.findByIdAndUpdate(
        hireRequestId,
        { status },
        { new: true }
      );

      // If no hire request was found
      if (!updatedRequest) {
        throw HttpMessage.NOT_FOUND;
      }
      console.log("this is the updatedRequesrt", updatedRequest);
      if (status === "accepted") {
        await UserService.updateGuideProfile(updatedRequest.guide, {
          status: "hired",
        });
        const guideNotification = {
          userId: updatedRequest.guide,
          message: ` your status has been updated to hired.`,
          type: "info",
        };
        await NotificationService.createNotification(guideNotification);
      }

      const message = `Your hire request has been ${status}.`;
      const notificationData = {
        userId: updatedRequest.client,
        message,
        type: "info",
      };
      await NotificationService.createNotification(notificationData);
      return updatedRequest;
    } catch (error) {
      console.error("Error updating hire request status:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }
}

module.exports = new HireRequestService();
