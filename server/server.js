
const request = require('request');
const Buffer = require('buffer').Buffer;
const axios = require('axios');


exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  /////////////////////////////////////  CREACIÓN DE TICKET   ////////////////////////////////////////
  onTicketCreateHandler: async function (args) {
    console.log('Hello ' + args['data']['requester']['name']);
    let ticketId = args.data.ticket.id;
    let companytId = args.data.ticket.company_id;
    let projectID;
    let listID;

    holded = args.data.ticket.custom_fields.cf_holded_2670978
    console.info("Ticket: " + ticketId);
    console.log('Company' + companytId)

    if (holded == "SI") {

      axios.get('https://watchandact-help.freshdesk.com/api/v2/companies/' + companytId, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(args.iparams.f_apikey).toString('base64'),
          'Content-Type': 'application/json'
        }
      }).then(async function (response) {
        const datosempresa = response.data;
        projectID = datosempresa.custom_fields.projectid;
        listID = datosempresa.custom_fields.listid;
        console.log(datosempresa);
        console.log('ID de proyecto' + projectID);
        console.log('ID de lista' + listID);
        const peticionTarea = {
          method: 'POST',
          url: 'https://api.holded.com/api/projects/v1/tasks',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            key: args.iparams.h_apikey
          },
          data: {
            projectId: projectID,
            listId: listID,
            name: args.data.ticket.subject
          }
        };

        function modificarIdentificador(response) {
          //console.log(response.data);

          console.log('Se ha podido crear la tarea en Holded perfectamente.')

          let datos = response.data.id;


          const anadir_hid = {
            method: 'PUT',
            url: 'https://watchandact-help.freshdesk.com/api/v2/tickets/' + ticketId,
            data: {

              "custom_fields":
              {
                "cf_holdedid": datos
              }

            },
            headers: {
              'Authorization': 'Basic ' + Buffer.from(args.iparams.f_apikey).toString('base64'),
              'Content-Type': 'application/json'
            }

          };

          axios(anadir_hid).then(function (response) {
            console.log("Holded Id añadido al campo", response.data);
          }).catch(function (error) {
            console.error("No se ha podido añadir al campo(Holded ID) :", error);
          });

          console.log('DATOS: ' + datos)
          console.log("Nuevo ID " + JSON.stringify(ticketId));

        }

        await axios.request(peticionTarea).then(modificarIdentificador).catch(async function (error) {
          if (projectID == null || listID == null) {
            console.error("No existen los id de proyecto o de lista.")
          }
          console.error(error);
        });
      }).catch(function (error) {
        console.log(error);
      })

      console.log('Fin de la condicion')
    }

  },

  /////////////////////////////////////  MODIFICAR TICKET ////////////////////////////////////////


  onTicketUpdateHandler: async function (payload) {

    console.log("Logging arguments from onTicketUpdate event: " + JSON.stringify(payload));
    //Finding fields that are changed
    var changes = payload.data.ticket.changes;
    let estado = payload.data.ticket.status;
    let empresa = payload.data.ticket.company_id;
    let bolsa_horas = 0;
    let bolsa_de_horas_restante;
    let operacion;
    let idticket= payload.data.ticket.id;
    let horas_estimadas = Number(payload.data.ticket.custom_fields.cf_horas_estimadas560353_2670978);
    let confirmación_h_estimadas = payload.data.ticket.custom_fields.cf_confirmacin_horas_estimadas_2670978;
    let e_holded = payload.data.ticket.custom_fields.cf_holded_2670978;
   let c_holdedid = payload.data.ticket.custom_fields.cf_holdedid_2670978;
    console.log('Estado del ticket: ' + estado);
    console.log('Id de Empresa: ' + empresa);
    console.log('Horas estimadas: ' + horas_estimadas);
    console.log('Confirmación de horas estimadas: ' + confirmación_h_estimadas);
    console.log('Bolsa de horas sin modificar: ' + bolsa_horas);
    console.log('Inicio de la operación: ' + operacion);
    console.log('Enviar a holded : ' + e_holded);
  
//Crear tarea al modifcar la opción de enviar a holded.

    console.log('Changes: ' + JSON.stringify(changes));
console.log('Holded task id: '+c_holdedid);
if(e_holded == "SI"){
  if(c_holdedid == null){
  axios.get('https://watchandact-help.freshdesk.com/api/v2/companies/' + empresa, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(payload.iparams.f_apikey).toString('base64'),
      'Content-Type': 'application/json'
    }
  }).then(async function(response){
    console.info('Datos de empresa: '+response.data);
    let idproyecto = response.data.custom_fields.projectid;
    let idlista = response.data.custom_fields.listid;
    console.info('ID de proyecto: '+idproyecto);
    console.info('ID de lista: '+idlista);


  const peticionTarea = {
          method: 'POST',
          url: 'https://api.holded.com/api/projects/v1/tasks',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            key: payload.iparams.h_apikey
          },
          data: {
            projectId: idproyecto,
            listId: idlista,
            name: payload.data.ticket.subject
          }
        };

        function modificarIdentificador(response) {
         
          console.log('Se ha podido crear la tarea en Holded perfectamente.')

          let datos = response.data.id;


          const anadir_hid = {
            method: 'PUT',
            url: 'https://watchandact-help.freshdesk.com/api/v2/tickets/' + idticket,
            data: {

              "custom_fields":
              {
                "cf_holdedid": datos
              }

            },
            headers: {
              'Authorization': 'Basic ' + Buffer.from(payload.iparams.f_apikey).toString('base64'),
              'Content-Type': 'application/json'
            }

          };

          axios(anadir_hid).then(function (response) {
            console.log("Holded Id añadido al campo", response.data);
          }).catch(function (error) {
            console.error("No se ha podido añadir al campo(Holded ID) :", error);
          });

          console.log('DATOS: ' + datos)
          console.log("Nuevo ID " + JSON.stringify(ticketId));

        }

        await axios.request(peticionTarea).then(modificarIdentificador).catch(async function (error) {
          if (idproyecto == null || idlista == null) {
            console.error("No existen los id de proyecto o de lista.")
          }
          console.error(error);
        });
    
  }).catch(function(error){
    console.error('No se ha podido acceder a los datos de la empresa: '+error);
  });
}else{
  console.info('Ya está en holded');

}
}
//Para la bolsa de horas 
    if (estado == 2) {

      axios.get('https://watchandact-help.freshdesk.com/api/v2/companies/' + empresa, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(payload.iparams.f_apikey).toString('base64'),
          'Content-Type': 'application/json'
        }
      }).then(async function (response) {
        console.log(response.data);
        bolsa_de_horas_restante = response.data.custom_fields.bolsa_de_horas_restante;
        console.log('BH:' + bolsa_de_horas_restante);
        console.log('HE:' + horas_estimadas);
        console.log('Operacion: ' + operacion);
        operacion = 0;
        operacion = Number(bolsa_de_horas_restante) + horas_estimadas;

        console.log('Operacion: ' + operacion);
        operacion = JSON.stringify(operacion);
        console.info('Horas totales: ' + bolsa_horas);


        const modificar_bh = {
          method: 'PUT',
          url: 'https://watchandact-help.freshdesk.com/api/v2/companies/' + empresa,
          data: {

            "custom_fields":
            {
              "bolsa_de_horas_restante": operacion

            }

          },
          headers: {
            'Authorization': 'Basic ' + Buffer.from(payload.iparams.f_apikey).toString('base64'),
            'Content-Type': 'application/json'
          }
        };

        axios(modificar_bh).then(function (response) {
          console.log("Company updated successfully Yay:", response.data);
        }).catch(function (error) {
          console.error("Error a la hora de modificar la bolsa de horas :", error);
        });



      }).catch(function (error) {
        console.error(error);
      });

    } else if (estado == 5) {

      axios.get('https://watchandact-help.freshdesk.com/api/v2/companies/' + empresa, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(payload.iparams.f_apikey).toString('base64'),
          'Content-Type': 'application/json'
        }
      }).then(async function (response) {
        console.log(response.data);
        bolsa_de_horas_restante = response.data.custom_fields.bolsa_de_horas_restante;
        console.log('Bolsa De Horas Restantes :' + bolsa_de_horas_restante);
        console.log('Operación: ' + operacion);
        operacion = 0;

        operacion = Number(bolsa_de_horas_restante) - horas_estimadas;
        operacion = JSON.stringify(operacion);
        console.info('Horas totales: ' + bolsa_horas);

        const modificar_bh = {
          method: 'PUT',
          url: 'https://watchandact-help.freshdesk.com/api/v2/companies/' + empresa,
          data: {

            "custom_fields":
            {
              "bolsa_de_horas_restante": operacion
            }

          },
          headers: {
            'Authorization': 'Basic ' + Buffer.from(payload.iparams.f_apikey).toString('base64'),
            'Content-Type': 'application/json'
          }

        };

        axios(modificar_bh).then(function (response) {
          console.log("La bolsa de horas se ha modificado correctamente: ", response.data);
        }).catch(function (error) {
          console.error("Error a la hora de modificar la bolsa de horas :", error);
        });

      }).catch(function (error) {
        console.error(error);
      });


    }

  },

  /////////////////////////////////////  MODIFICAR REGISTRO DE TIEMPO   ////////////////////////////////////////


  onTimeEntryCreateHandler: async function (args) {

    let facturable = args.data.time_entry.billable;
    let ticket_id = args.data.time_entry.ticket_id;
    let descripcion = args.data.time_entry.note;
    let f_user = JSON.stringify(args.data.time_entry.agent_id);
    let duracion = args.data.time_entry.time_spent;


    console.log('Facturable: ' + facturable);
    console.log('Duración: ' + duracion);
    console.log('Ticket ID: ' + ticket_id);

    if (facturable == true) {

      axios.get('https://watchandact-help.freshdesk.com/api/v2/tickets/' + ticket_id, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(args.iparams.f_apikey).toString('base64'),
          'Content-Type': 'application/json'
        }
      }).then(async function (response) {

        console.log('¡Ticket encontrado!: ' + JSON.stringify(response.data));
        let id_empresa = response.data.company_id
        let h_taskid = response.data.custom_fields.cf_holdedid;
        console.info('Id de empresa: ' + id_empresa);
        console.info('Id de la tarea de holded: ' + h_taskid);
        console.info('Nota: ' + descripcion);
        console.info('ID de agente de Freshdesk  : ' + f_user);

        axios.get('https://watchandact-help.freshdesk.com/api/v2/companies/' + id_empresa, {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(args.iparams.f_apikey).toString('base64'),
            'Content-Type': 'application/json'
          }
        }).then(function (response) {
          console.info('Empresa encontrada ' + JSON.stringify(response.data));
          let project_id = response.data.custom_fields.projectid;
          console.info('Id de proyecto: ' + project_id)


          axios.get('https://watchandact-help.freshdesk.com/api/v2/agents/' + f_user, {
            headers: {
              'Authorization': 'Basic ' + Buffer.from(args.iparams.f_apikey).toString('base64'),
              'Content-Type': 'application/json'
            }
          }).then(
            function (response) {
              let h_agentid = response.data.contact.phone;
              console.info('ID de Agente de Holded : ' + h_agentid);

              const options = {

                method: 'POST',
                url: 'https://api.holded.com/api/projects/v1/projects/' + project_id + '/times',
                headers: {
                  accept: 'application/json',
                  'content-type': 'application/json',
                  key: args.iparams.h_apikey
                },
                data: {
                  duration: duracion,
                  desc: descripcion,
                  costHour: 0,
                  userId: h_agentid,
                  taskId: h_taskid
                }
              };

              axios.request(options).then(function (response) {
                  console.log(response.data);
                }).catch(function (error) {
                  console.error('No se ha podido enviar el registro de tiempo'+error);
                });
            }).catch(function (error) {
              console.error('No se ha encontrado al agente: ' + error);
            });

        }).catch(
          function (error) {
            console.error('No se ha encotrado la empresa: ' + error);
          });




      }).catch(function (error) {
        console.error("No se ha podido recoger ticket id: " + error);
      });

    }
    // console.log('DATA: '+JSON.stringify(args));
   

  }
};
