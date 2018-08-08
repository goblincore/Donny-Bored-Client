import {
    FETCH_MOODBOARDS_SUCCESS,
    FETCH_MOODBOARDS_ERROR,
    DELETE_MOODBOARD_SUCCESS
} from '../actions/moodboards';

const initialState = {
    data: [],
    error: null
};

export function moodboardReducer(state = initialState, action) {
    if (action.type === FETCH_MOODBOARDS_SUCCESS) {
        console.log('FETCH MOODBOARDS SUCCESS ACTION',action.data)
        return Object.assign({}, state, {
            data: action.data,
            error: null
        });
    } else if (action.type === FETCH_MOODBOARDS_ERROR) {
        return Object.assign({}, state, {
            error: action.error
        });

    } else if (action.type === DELETE_MOODBOARD_SUCCESS){
        return Object.assign({}, state, {
            data: action.data,
            error: action.error
        });

    }



    return state;
}
