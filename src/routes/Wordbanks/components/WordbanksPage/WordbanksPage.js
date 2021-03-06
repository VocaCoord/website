import React from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'react-redux-firebase'
import { Route, Switch } from 'react-router-dom'
import Scrollbar from 'react-scrollbars-custom'
import ItemTile from 'components/ItemTile'
import NewItemTile from 'components/NewItemTile'
import { renderChildren } from 'utils/router'
import AddWordbankDialog from '../AddWordbankDialog'
import EditWordbankDialog from '../EditWordbankDialog'
import WordsRoute from 'routes/Words'

const WordbanksPage = ({
  wordbanks,
  auth,
  addDialogOpen,
  toggleAddDialog,
  editDialogOpen,
  toggleEditDialog,
  deleteWordbank,
  addWordbank,
  editWordbank,
  classes,
  match,
  selected,
  goToWords
}) => (
  <Switch>
    {renderChildren([WordsRoute], match)}
    <Route
      exact
      path={match.path}
      render={() => (
        <div>
          <div className={classes.header}>
            <div className={classes.headerText}>Wordbanks</div>
          </div>
          <Scrollbar className={classes.scrollbar}>
            <div className={classes.root}>
              <AddWordbankDialog
                onSubmit={addWordbank}
                open={addDialogOpen}
                onRequestClose={toggleAddDialog}
              />
              <EditWordbankDialog
                onSubmit={editWordbank}
                open={editDialogOpen}
                onRequestClose={toggleEditDialog}
                initialValues={selected}
              />
              <div className={classes.tiles}>
                <NewItemTile onClick={toggleAddDialog} />
                {!isEmpty(wordbanks) &&
                  wordbanks.map((wordbank, i) => (
                    <ItemTile
                      key={`Wordbank-${wordbank.id}-${i}`}
                      onSelect={() => goToWords(wordbank)}
                      onDelete={() => deleteWordbank(wordbank.id)}
                      onOpenEdit={toggleEditDialog}
                      item={wordbank}
                    />
                  ))}
              </div>
            </div>
          </Scrollbar>
        </div>
      )}
    />
  </Switch>
)

WordbanksPage.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  auth: PropTypes.object,
  wordbanks: PropTypes.array,
  addDialogOpen: PropTypes.bool,
  toggleAddDialog: PropTypes.func.isRequired,
  editDialogOpen: PropTypes.bool,
  toggleEditDialog: PropTypes.func.isRequired,
  deleteWordbank: PropTypes.func.isRequired,
  addWordbank: PropTypes.func.isRequired
}

export default WordbanksPage
