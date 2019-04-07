import { Meteor } from "meteor/meteor";

export const roleOptions = ["admin", "moderator", "user"]

export const permissions = {
  adminPage: ["admin", "moderator"],
  changeRole: ["admin"],
  deleteUser: ["admin"],
  deleteResource: ["admin", "moderator"],
  editResource: ["admin", "moderator"],
}

export const rolesDataKey = "__global_roles__";

export const checkPermissions = (action) => {
  const rolesAllowed = permissions[action];

  const isPermission  = new Promise((resolve, reject) =>
      Meteor.call('Admin.checkPermissions', { rolesAllowed }, (err, res) => {
        if (err) {
          reject(err);
          throw new Meteor.Error('could not grant action')        
        }
          resolve(res);
        })
  );
  return isPermission;
}