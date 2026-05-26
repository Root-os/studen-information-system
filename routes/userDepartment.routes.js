const router = require("express").Router();
const controller = require("../controllers/userDepartment.controller");

router.post("/assign", controller.assignUserToDepartment);

router.get("/", controller.getAssignments);

router.get("/:departmentId", controller.getDepartmentUsers);

router.get("/user/:userId", controller.getUserDepartments);

router.delete("/:id", controller.removeUserFromDepartment);

module.exports = router;