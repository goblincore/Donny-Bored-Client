import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { getLength, getAngle, getCursor } from './utils';
import {connect} from 'react-redux';
import {deleteImage} from '../../actions/images';
import './css/image.css';


const zoomableMap = {
  'n': 't',
  's': 'b',
  'e': 'r',
  'w': 'l',
  'ne': 'tr',
  'nw': 'tl',
  'se': 'br',
  'sw': 'bl'
}
class Rect extends PureComponent {
  static propTypes = {
    styles: PropTypes.object,
    zoomable: PropTypes.string,
    rotatable: PropTypes.bool,
    onResizeStart: PropTypes.func,
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
    onRotateStart: PropTypes.func,
    onRotate: PropTypes.func,
    onRotateEnd: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    parentRotateAngle: PropTypes.number
  }

  setElementRef = ref => this.$element = ref;

  // Drag
  startDrag = (e) => {
    var { clientX: startX, clientY: startY } = e
    this.props.onDragStart && this.props.onDragStart()
    this._isMouseDown = true
    const onMove = (e) => {
      if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
      e.stopImmediatePropagation()
      const { clientX, clientY } = e
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      this.props.onDrag(deltaX, deltaY)
      startX = clientX
      startY = clientY
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false
      this.props.onDragEnd && this.props.onDragEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // Rotate
  startRotate = (e) => {
    if (e.button !== 0) return
    const { clientX, clientY } = e
    const { styles: { transform: { rotateAngle: startAngle } } } = this.props
    const rect = this.$element.getBoundingClientRect()
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
    var startVector = {
      x: clientX - center.x,
      y: clientY - center.y
    }
    this.props.onRotateStart && this.props.onRotateStart()
    this._isMouseDown = true
    const onMove = (e) => {
      if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
      e.stopImmediatePropagation()
      const { clientX, clientY } = e
      const rotateVector = {
        x: clientX - center.x,
        y: clientY - center.y
      }
      const angle = getAngle(startVector, rotateVector)
      this.props.onRotate(angle, startAngle)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false
      this.props.onRotateEnd && this.props.onRotateEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // Resize
  startResize = (e, cursor) => {
    if (e.button !== 0) return
    document.body.style.cursor = cursor
    const { styles: { position: { centerX, centerY }, size: { width, height }, transform: { rotateAngle } } } = this.props
    const { clientX: startX, clientY: startY } = e
    const rect = { width, height, centerX, centerY, rotateAngle }
    const type = e.target.getAttribute('class').split(' ')[0]
    this.props.onResizeStart && this.props.onResizeStart()
    this._isMouseDown = true
    const onMove = (e) => {
      if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
      e.stopImmediatePropagation()
      const { clientX, clientY } = e
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      const alpha = Math.atan2(deltaY, deltaX)
      const deltaL = getLength(deltaX, deltaY)
      const isShiftKey = e.shiftKey
      this.props.onResize(deltaL, alpha, rect, type, isShiftKey)
    }

    const onUp = () => {
      document.body.style.cursor = 'auto'
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false
      this.props.onResizeEnd && this.props.onResizeEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  render () {
    const images=this.props.allImages;
    const imageId = this.props.imageId;
    const { styles: { position: { centerX, centerY }, size: { width, height }, transform: { rotateAngle } }, zoomable, rotatable, parentRotateAngle } = this.props
    const style = { background:`url(${images[imageId].imageurl}) no-repeat 0px 0px/100% 100%`, width: Math.abs(width), height: Math.abs(height), transform: `rotate(${rotateAngle}deg)`, left: centerX - Math.abs(width) / 2, top: centerY - Math.abs(height) / 2 }
     //const style = {  width: Math.abs(width), height: Math.abs(height), transform: `rotate(${rotateAngle}deg)`, left: centerX - Math.abs(width) / 2, top: centerY - Math.abs(height) / 2 }
    const direction = zoomable.split(',').map(d => d.trim()).filter(d => d)
   // console.log('RECT CHILD SEE IF I CAN GET STORE',this.props.allImages);
    //console.log('image id test', this.props.imageId);
  

    return (
      <div
        ref={this.setElementRef}
        onMouseDown={this.startDrag}
        className="rect single-resizer"
        style={style}
      >
          <div className="delete-image"><button onClick={()=>this.props.dispatch(deleteImage(imageId,this.props.board_id))}>delet</button></div>
        {rotatable && <div className="rotate" onMouseDown={this.startRotate}><i></i></div>}
        {direction.map(d => {
          const cursor = `${getCursor(rotateAngle + parentRotateAngle, d)}-resize`
          return (
            <div key={d} style={{ cursor }} className={`${zoomableMap[d]} resizable-handler`} onMouseDown={(e) => this.startResize(e, cursor)}></div>
          )
        })}
        {direction.map(d => {
          return (
            <div key={d} className={`${zoomableMap[d]} square`} />
          )
        })}
      </div>
    )
  }
}



const mapStateToProps = state => ({
  //moodboardImages: state.images.moodboardImages,
  allImages: state.images.allImages,
  user_id:state.auth.currentUser.id,
  board_id:state.moodboards.board_id
 
  
});

export default connect(mapStateToProps)(Rect)