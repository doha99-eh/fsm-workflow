import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import withConfirmDialog from '../ConfirmDialog';
import { isDef, formatArg, formatLabel } from '../utils';
import guardPropTypes from './guardPropTypes';
import GuardEditor from './GuardEditor.react';
import './Guards.less';

@withConfirmDialog
export default class GuardsTable extends PureComponent {
  static propTypes = {
    guards: PropTypes.arrayOf(guardPropTypes),
    conditions: PropTypes.objectOf(PropTypes.shape({
      paramsSchema: PropTypes.object
    })),
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    objectConfiguration: PropTypes.object.isRequired,
    componentsRegistry: PropTypes.objectOf(PropTypes.func)
  }

  static contextTypes = {
    i18n: PropTypes.object.isRequired
  }

  state = {
    guards: this.props.guards || [],
    showEditor: false,
    currentGuardIndex: null
  }

  onDelete = index => this.setState(prevState => ({
    guards: prevState.guards.filter((_, i) => i !== index)
  }))

  hasUnsavedChanges = _ => {
    const { guards: stateGuards } = this.state;
    const { guards } = this.props;
    return !isEqual(stateGuards, guards)
  }

  handleClose = this._triggerDialog({
    showDialog: this.hasUnsavedChanges,
    confirmHandler: this.props.onClose
  })

  handleDelete = index => this._triggerDialog({
    confirmHandler: _ => this.onDelete(index),
    message: `Do you really want to remove this guard?`
  })

  handleSave = _ => this.props.onSave(this.state.guards)

  handleOpenEditor = index => _ => this.setState({
    showEditor: true,
    currentGuardIndex: index
  })

  handleCloseEditor = _ => this.setState({
    showEditor: false,
    currentGuardIndex: null
  })

  handleSaveGuard = index => guard => this.setState(prevState => {
    const guardIsDefined = ('expression' in guard && !!guard.expression) ||
      Object.keys(guard).filter(k => k !== 'expression').length > 0;
    let newGuards;
    if (isDef(index)) {
      newGuards = guardIsDefined ?
        prevState.guards.map((g, i) => i === index ? guard : g) :
        prevState.guards.filter((_, i) => i !== index)
    } else {
      newGuards = guardIsDefined && prevState.guards.concat(guard)
    }
    return newGuards ? { guards: newGuards } : {}
  }, this.handleCloseEditor);


  render() {
    const { i18n } = this.context;
    const { title, conditions, objectConfiguration, componentsRegistry } = this.props;
    const { guards, showEditor, currentGuardIndex } = this.state;

    let editorModal;

    if (showEditor) {
      let guard;

      if (isDef(currentGuardIndex)) {
        guard = guards[currentGuardIndex]
      }

      editorModal = (
        <GuardEditor
          guard={guard}
          conditions={conditions}
          objectConfiguration={objectConfiguration}
          componentsRegistry={componentsRegistry}
          onClose={this.handleCloseEditor}
          onSave={this.handleSaveGuard(currentGuardIndex)}
        />
      )
    }

    return (
      <Modal
        show={true}
        onHide={this.handleClose}
        dialogClassName="oc-fsm-crud-editor--modal"
        backdrop='static'
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="oc-fsm-crud-editor--states-editor">
            <Table className="oc-fsm-crud-editor--table-actions">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Parameters</th>
                  <th className='text-right'>
                    <Button
                      bsSize='sm'
                      onClick={this.handleOpenEditor()}
                    >
                      Add
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  guards.length > 0 ?
                    guards.map(({ name: guardName, params, expression }, index) => (
                      <tr key={`${guardName}-${index}`}>
                        <td style={{ paddingTop: '15px' }}>
                          {
                            guardName ?
                              formatLabel(guardName) :
                              'JavaScript Expression'
                          }
                        </td>
                        <td>
                          {
                            (Array.isArray(params) && params.length > 0) ?
                              (
                                <table className="oc-fsm-crud-editor--table-actions-parameters">
                                  <tbody>
                                    {
                                      params.map(({ name, value }, i) => {
                                        return (
                                          <tr key={`${i}-${name}`}>
                                            <td>{formatLabel(name)}</td>
                                            <td className="parameter-value">
                                              {
                                                formatArg({
                                                  i18n,
                                                  schema: conditions[guardName].paramsSchema.properties[name],
                                                  value
                                                })
                                              }
                                            </td>
                                          </tr>
                                        )
                                      })
                                    }
                                  </tbody>
                                </table>
                              ) :
                              (
                                <pre>{expression}</pre>
                              )
                          }
                        </td>
                        <td className='text-right'>
                          <ButtonGroup bsStyle='sm'>
                            <Button
                              onClick={this.handleOpenEditor(index)}
                            >
                              <Glyphicon glyph='edit' />
                              {'\u2000'}
                              Edit
                            </Button>
                            <Button
                              onClick={this.handleDelete(index)}
                            >
                              <Glyphicon glyph='trash' />
                              {'\u2000'}
                              Delete
                            </Button>
                          </ButtonGroup>
                        </td>
                      </tr>
                    )) :
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center' }}>
                        No guards specified for this transition. Go ahead and{`\u00A0`}
                        <a
                          onClick={this.handleOpenEditor()}
                          style={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          add new
                        </a>!
                      </td>
                    </tr>
                }
              </tbody>
            </Table>

            {editorModal}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            bsStyle="primary"
            onClick={this.handleSave}
          >
            Ok
          </Button>
          <Button onClick={this.handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}