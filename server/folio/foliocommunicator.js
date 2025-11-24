import Folio from '@indexdata/foliojs'

class FolioCommunicator {
  constructor(url, tenant, username, password) {
    this.url = url
    this.tenant = tenant,
    this.username = username
    this.password = password
    this.service = null
    this.session = null
    this.sessionStart = null
  }
  
  async createOrUpdateCredentials(userId, password) {
    await this._checkSession()

    try {  
      let path = "/patron-pin";
      let body = {
        id: userId,
        pin: password
      };
  
      return await this.session.folioFetch(path, { json: body });
      
    } catch (error) {
      console.error(error.message)
    }
  }

  async getUserWithBarcode(barcode) {
    await this._checkSession()
    
    const path = "/users?limit=1&query="
    const query = `(barcode="${barcode}" or username="${barcode}")`
    const body = await this.session.folioFetch(path+query)
    return body.users[0]
  }

  async getPagingSlips() {
    await this._checkSession()
    try {
      let paged = await this.session.folioFetch('/circulation/requests?limit=100&query=(requestType="Page" and status="Open - Not yet filled") sortby requestDate')
      let recalls = await this.session.folioFetch('/circulation/requests?limit=500&query=(requestType="Recall" and status="Open - Not yet filled") sortby requestDate')

      return [...paged.requests, ...recalls.requests.filter(request => request.item.status == 'In process')]
    } catch (error) {
      console.error(error.message);
    }
  }

  async getServicePointsWithHoldShelf() {
    await this._checkSession()
    try {
      let response = await this.session.folioFetch('/service-points')
      let sp = response.servicepoints.filter(lib => lib.holdShelfExpiryPeriod != null)
      return sp
    } catch (error) {
      console.error(error.message);
    }
  }

  async getShelfList(id) {
    await this._checkSession()
    try {
      let response = await this.session.folioFetch(`/circulation/requests-reports/hold-shelf-clearance/${id}`)
      return response
    } catch (error) {
      console.error(error.message);
    }
  }

  async getUser(username) {
    await this._checkSession()

    let path = "/users?limit=1&query=";
    let query = '(username="' + username + '")';

    let data = await this.session.folioFetch(path + query);

    let res = null;
    if (data.totalRecords > 0) {
      res = data.users[0];
    }

    return res;
  }

  async updatePassword(username, password) {
    try {
      let user = await this.getUser(username);
      const res = await this.createOrUpdateCredentials(user.id, password);
      return res      
    } catch (error) {
      console.error(error.message);
      
    }
  }

  async _checkSession() {
    let now = new Date()
    let diff = now - this.sessionStart
    if(!this.session || diff > 1000*60*8) {
      await this._login()
    }
  }

  async _getCredentialsExists(userId) {
    try {
      await this._checkSession()
  
      let path = "/authn/credentials-existence";
      let query = `?userId=${userId}`;
  
      let response = await this.session.folioFetch(path + query);
  
      return response.credentialsExist;
      
    } catch (error) {
      console.error(error.message);
            
    }
  }

  async _login() {
    // console.log('Logging in!')
    
    this.service = Folio.service(this.url)
    this.session = await this.service.login(this.tenant, this.username, this.password)
    this.sessionStart = new Date()
  }

  async _removeCredentials(userId) {
    try {
      await this._checkSession()
  
      let path = "/authn/credentials";
      let query = `?userId=${userId}`;
  
      let response = await this.session.folioFetch(path + query, {method: "DELETE"});   
  
      return response;
      
    } catch (error) {
      console.error(error.message);
            
    }
  }

}

export default FolioCommunicator