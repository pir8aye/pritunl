define([
  'jquery',
  'underscore',
  'backbone',
  'models/user',
  'views/modal',
  'text!templates/modalAddUser.html'
], function($, _, Backbone, UserModel, ModalView, modalAddUserTemplate) {
  'use strict';
  var lastOrg;
  var ModalAddUserView = ModalView.extend({
    className: 'add-user-modal',
    template: _.template(modalAddUserTemplate),
    title: 'Add User',
    okText: 'Add',
    hasAdvanced: true,
    events: function() {
      return _.extend({
        'click .bypass-secondary-toggle': 'onBypassSecondarySelect'
      }, ModalAddUserView.__super__.events);
    },
    initialize: function(options) {
      this.orgs = options.orgs;
      ModalAddUserView.__super__.initialize.call(this);
    },
    body: function() {
      return this.template({
        orgs: this.orgs.toJSON(),
        lastOrg: lastOrg
      });
    },
    getPortForwarding: function() {
      var item;
      var protocol;
      var port;
      var dport;
      var ports = [];

      var data = this.$('.port-forwarding input').val();
      data = data.split(',');

      for (var i = 0; i < data.length; i++) {
        protocol = null;
        port = null;
        dport = null;

        item = data[i];
        item = item.split('/');

        if (item.length === 2) {
          protocol = item[1];
        }
        item = item[0].split(':');

        if (item.length === 2) {
          dport = item[1];
        }
        port = item[0];

        ports.push({
          protocol: protocol,
          port: port,
          dport: dport
        });
      }

      return ports;
    },
    getBypassSecondarySelect: function() {
      return this.$('.bypass-secondary-toggle .selector').hasClass('selected');
    },
    setBypassSecondarySelect: function(state) {
      if (state) {
        this.$('.bypass-secondary-toggle .selector').addClass('selected');
        this.$('.bypass-secondary-toggle .selector-inner').show();
      }
      else {
        this.$('.bypass-secondary-toggle .selector').removeClass('selected');
        this.$('.bypass-secondary-toggle .selector-inner').hide();
      }
    },
    onBypassSecondarySelect: function() {
      this.setBypassSecondarySelect(!this.getBypassSecondarySelect());
    },
    onOk: function() {
      var i;
      var name = this.$('.name input').val();
      var org = this.$('.org select').val();
      var email = this.$('.email input').val();
      var emailReg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      var dnsSuffix = this.$('.dns-suffix input').val();
      var pin = this.$('.pin input').val() || null;
      var bypassSecondary = this.getBypassSecondarySelect();
      var portForwarding = this.getPortForwarding();

      var networkLink;
      var networkLinks = [];
      var networkLinksTemp = this.$('.network-links input').val().split(',');
      for (i = 0; i < networkLinksTemp.length; i++) {
        networkLink = $.trim(networkLinksTemp[i]);
        if (networkLink) {
          networkLinks.push(networkLink);
        }
      }

      var dnsServer;
      var dnsServers = [];
      var dnsServersTemp = this.$('.dns-servers input').val().split(',');
      for (i = 0; i < dnsServersTemp.length; i++) {
        dnsServer = $.trim(dnsServersTemp[i]);
        if (dnsServer) {
          dnsServers.push(dnsServer);
        }
      }

      if (!name) {
        this.setAlert('danger', 'Name can not be empty.', '.form-group.name');
        return;
      }
      if (!email) {
        email = null;
      }
      else if (!emailReg.test(email)) {
        this.setAlert('danger', 'Email is not valid.', '.form-group.email');
        return;
      }
      lastOrg = org;

      this.setLoading('Adding user...');
      var userModel = new UserModel();
      userModel.save({
        organization: org,
        name: name,
        email: email,
        pin: pin,
        network_links: networkLinks,
        bypass_secondary: bypassSecondary,
        dns_servers: dnsServers,
        dns_suffix: dnsSuffix,
        port_forwarding: portForwarding
      }, {
        success: function() {
          this.close(true);
        }.bind(this),
        error: function(model, response) {
          this.clearLoading();
          if (response.responseJSON) {
            this.setAlert('danger', response.responseJSON.error_msg);
          }
          else {
            this.setAlert('danger', this.errorMsg);
          }
        }.bind(this)
      });
    }
  });

  return ModalAddUserView;
});
