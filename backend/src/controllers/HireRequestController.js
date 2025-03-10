const HireRequestService = require("../services/hireRequestService");

class HireRequestController {
  async getHireRequestsForGuide(req, res, next) {
    const userId = req.userId;
    try {
      const hireRequests = await HireRequestService.getHireRequestsForGuide(
        userId
      );

      res.locals.responseData = hireRequests;
      console.log(hireRequests);
      next();
    } catch (error) {
      res.locals.responseData = { error: error.message };
      console.log(error);
      next();
    }
  }

  async getHireRequestsForUser(req, res, next) {
    const userId = req.userId;
    try {
      const hireRequests = await HireRequestService.getHireRequestsForClient(
        userId
      );

      res.locals.responseData = hireRequests;
      console.log(hireRequests);
      next();
    } catch (error) {
      res.locals.responseData = { error: error.message };
      console.log(error);
      next();
    }
  }

  async updateHireRequestStatus(req, res, next) {
    const hireRequestId = req.params.hireRequestId;
    const { status } = req.body;

    if (!["pending", "accepted", "cancelled", "completed"].includes(status)) {
      res.locals.responseData = { error: "Invalid status" };
      return next();
    }

    try {
      const updatedRequest = await HireRequestService.updateHireRequestStatus(
        hireRequestId,
        status
      );

      res.locals.responseData = updatedRequest;
      console.log(updatedRequest);
      next();
    } catch (error) {
      res.locals.responseData = { error: error.message };
      console.log(error);
      next();
    }
  }
}

module.exports = new HireRequestController();
