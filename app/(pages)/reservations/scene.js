import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { DEFAULT_THEME, chairSlots, footprint, preset } from "./model";

// 1 unit = 1 metre. The restaurant floor is centred on the origin.
const WALL_H = 3;
const EYE_H = 1.65;
const WALL_OPACITY = { normal: 0.42, blocking: 0.06 };


// Seeded random numbers: the floor pattern stays the same while a colour is tweaked.
function seeded(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Procedural parquet in the chosen colour, so we don't ship any image assets.
function makeFloorTexture(color, pattern) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = color;
  g.fillRect(0, 0, 512, 512);
  if (pattern) {
    const rnd = seeded(7);
    const plankW = 64;
    const plankH = 256;
    for (let x = 0; x < 512; x += plankW) {
      for (let y = -((x / plankW) % 2) * (plankH / 2); y < 512; y += plankH) {
        // Each plank is a little lighter or darker than the base colour.
        const shade = (rnd() - 0.5) * 0.22;
        g.fillStyle = shade > 0 ? `rgba(255,255,255,${shade})` : `rgba(0,0,0,${-shade})`;
        g.fillRect(x, y, plankW, plankH);
        g.strokeStyle = "rgba(0,0,0,0.25)";
        g.lineWidth = 2;
        g.strokeRect(x, y, plankW, plankH);
        g.strokeStyle = "rgba(0,0,0,0.06)";
        for (let i = 0; i < 6; i++) {
          g.beginPath();
          const gx = x + 6 + rnd() * (plankW - 12);
          g.moveTo(gx, y);
          g.bezierCurveTo(gx + 6, y + 80, gx - 6, y + 160, gx, y + plankH);
          g.stroke();
        }
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}



// seat: the state colour (normal / booked / extra). The back follows the seat
// for booked and extra chairs so the state reads at a glance; legs keep their own colour.
function makeChair(seatMat, backMat, legMat) {
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), seatMat);
  seat.position.y = 0.45;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.05), backMat);
  back.position.set(0, 0.7, -0.19);
  chair.add(seat, back);
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6);
  for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.225, z);
    chair.add(leg);
  }
  chair.traverse((o) => (o.castShadow = true));
  return chair;
}


function buildTable(table, topColor, legColor) {
  const group = new THREE.Group();
  const p = preset(table.shape, table.size);
  const topMat = new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.55 });
  const legMat = new THREE.MeshStandardMaterial({ color: legColor, roughness: 0.6 });
  let top;
  if (table.shape === "round") {
    const r = p.d / 2;
    top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.05, 40), topMat);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.25, 0.72, 16), legMat);
    leg.position.y = 0.36;
    group.add(leg);
  } else {
    const { w, d } = p;
    top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), topMat);
    const legGeo = new THREE.BoxGeometry(0.06, 0.72, 0.06);
    for (const [x, z] of [[-w / 2 + 0.08, -d / 2 + 0.08], [w / 2 - 0.08, -d / 2 + 0.08], [-w / 2 + 0.08, d / 2 - 0.08], [w / 2 - 0.08, d / 2 - 0.08]]) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, 0.36, z);
      group.add(leg);
    }
  }
  top.position.y = 0.75;
  group.add(top);
  // Small candle so the scene feels like a restaurant, not a wireframe.
  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.1, 10),
    new THREE.MeshStandardMaterial({ color: 0xfff4d6, emissive: 0xffb347, emissiveIntensity: 0.6 })
  );
  candle.position.y = 0.83;
  group.add(candle);
  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return group;
}

// Glowing pad on the floor under the table, coloured by availability.
function buildRing(table, color) {
  const p = preset(table.shape, table.size);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.38, depthWrite: false });
  let geo;
  if (table.shape === "round") {
    const r = p.d / 2 + 0.75;
    geo = new THREE.RingGeometry(r - 0.12, r, 48);
  } else {
    const outer = (w, d) => {
      const s = new THREE.Shape();
      s.moveTo(-w / 2, -d / 2);
      s.lineTo(w / 2, -d / 2);
      s.lineTo(w / 2, d / 2);
      s.lineTo(-w / 2, d / 2);
      s.closePath();
      return s;
    };
    const w = p.w + 1.5;
    const d = p.d + 1.5;
    const shape = outer(w, d);
    shape.holes.push(outer(w - 0.24, d - 0.24));
    geo = new THREE.ShapeGeometry(shape);
  }
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  return ring;
}

export class RestaurantScene {
  constructor(container, { onSelect, onMove }) {
    this.container = container;
    this.onSelect = onSelect;
    this.onMove = onMove;
    this.editable = false;
    this.tableObjects = new Map();

    const { clientWidth: w, clientHeight: h } = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(this.renderer.domElement);

    this.labels = new CSS2DRenderer();
    this.labels.setSize(w, h);
    this.labels.domElement.className = "rs-labels";
    container.appendChild(this.labels.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    this.camera.position.set(0, 14, 14);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 45;

    this.theme = DEFAULT_THEME;
    this.hemi = new THREE.HemisphereLight(0xfff3e0, 0x5a4636, 1.15);
    this.scene.add(this.hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(6, 14, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0005;
    this.sun = sun;
    this.scene.add(sun);

    this.room = new THREE.Group();
    this.scene.add(this.room);
    this.tablesGroup = new THREE.Group();
    this.scene.add(this.tablesGroup);
    this.floorTex = makeFloorTexture(this.theme.floor, this.theme.floorPattern);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.drag = null;

    const el = this.renderer.domElement;
    this._down = (e) => this.handleDown(e);
    this._move = (e) => this.handleMove(e);
    this._up = (e) => this.handleUp(e);
    el.addEventListener("pointerdown", this._down);
    el.addEventListener("pointermove", this._move);
    window.addEventListener("pointerup", this._up);

    this._resize = () => this.resize();
    this.resizeObserver = new ResizeObserver(this._resize);
    this.resizeObserver.observe(container);

    this.camTween = null;
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.tick();
    };
    loop();
  }

  tick() {
    if (this.camTween) {
      const t = Math.min(1, (performance.now() - this.camTween.start) / 900);
      const k = 1 - Math.pow(1 - t, 3);
      this.camera.position.lerpVectors(this.camTween.fromPos, this.camTween.toPos, k);
      this.controls.target.lerpVectors(this.camTween.fromTarget, this.camTween.toTarget, k);
      if (t === 1) this.camTween = null;
    }
    this.controls.update();
    this.fadeWalls();
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.scene, this.camera);
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labels.setSize(w, h);
    this.applyInset();
  }

  // Keep the scene centred in the part of the canvas a panel leaves free
  // (pixels covered on the left / right / bottom). Picking and labels follow the camera.
  setInset(left = 0, right = 0, bottom = 0) {
    this.inset = { left, right, bottom };
    this.applyInset();
  }

  applyInset() {
    const { clientWidth: w, clientHeight: h } = this.container;
    const { left = 0, right = 0, bottom = 0 } = this.inset || {};
    if (!w || !h) return;
    if (!left && !right && !bottom) this.camera.clearViewOffset();
    else this.camera.setViewOffset(w, h, -(left - right) / 2, bottom / 2, w, h);
    this.camera.updateProjectionMatrix();
  }

  setRoom(width, depth) {
    if (this.roomSize && this.roomSize.width === width && this.roomSize.depth === depth) return;
    const resized = !!this.roomSize;
    this.roomSize = { width, depth };
    // A new room size needs a new framing (the walk-in view stays where it is).
    if (resized && this.lastView && this.lastView !== "walk") setTimeout(() => this.view(this.lastView), 0);
    this.room.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
    });
    this.room.clear();

    const tex = this.floorTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(width / 2.5, depth / 2.5);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.room.add(floor);

    // Walls with a door gap on the front wall, where the "walk in" camera stands.
    // Each side gets its own materials so it can fade out when it stands
    // between the camera and the room (see fadeWalls).
    const t = 0.15;
    const trimMat = new THREE.MeshStandardMaterial({ color: this.theme.trim, roughness: 0.7 });
    const side = (axis, limit) => {
      const s = {
        axis,
        limit,
        opacity: 1,
        mats: [
          new THREE.MeshStandardMaterial({
            color: this.theme.wall,
            roughness: 0.2,
            metalness: 0.1,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: WALL_OPACITY.normal,
            depthWrite: false,
          }),
          trimMat.clone(),
        ],
      };
      s.mats[1].transparent = true;
      return s;
    };
    this.walls = { back: side("z", -depth / 2), front: side("z", depth / 2), left: side("x", -width / 2), right: side("x", width / 2) };
    const addWall = (s, w, x, z, rotY) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_H, t), s.mats[0]);
      wall.position.set(x, WALL_H / 2, z);
      wall.rotation.y = rotY;
      wall.receiveShadow = true;
      const trim = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, t + 0.04), s.mats[1]);
      trim.position.set(x, 0.06, z);
      trim.rotation.y = rotY;
      this.room.add(wall, trim);
    };
    addWall(this.walls.back, width + t, 0, -depth / 2, 0);
    addWall(this.walls.left, depth, -width / 2, 0, Math.PI / 2);
    addWall(this.walls.right, depth, width / 2, 0, Math.PI / 2);
    const door = 1.6;
    const seg = (width - door) / 2;
    addWall(this.walls.front, seg, -door / 2 - seg / 2, depth / 2, 0);
    addWall(this.walls.front, seg, door / 2 + seg / 2, depth / 2, 0);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(door, WALL_H - 2.2, t), this.walls.front.mats[0]);
    lintel.position.set(0, 2.2 + (WALL_H - 2.2) / 2, depth / 2);
    this.room.add(lintel);

    // Hanging pendant lights spread over the room.
    const lampMat = new THREE.MeshStandardMaterial({ color: this.theme.lampColor, emissive: this.theme.lampColor, emissiveIntensity: 1.2 });
    const cols = Math.max(1, Math.round(width / 4));
    const rows = Math.max(1, Math.round(depth / 4));
    for (let i = 0; this.theme.lamps && i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = -width / 2 + (width / cols) * (i + 0.5);
        const z = -depth / 2 + (depth / rows) * (j + 0.5);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), lampMat);
        lamp.position.set(x, WALL_H - 0.6, z);
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 4), trimMat);
        cord.position.set(x, WALL_H - 0.3, z);
        this.room.add(lamp, cord);
      }
    }

    const s = Math.max(width, depth);
    Object.assign(this.sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s });
    this.sun.shadow.camera.updateProjectionMatrix();
  }

  // Apply new colours. Lights change in place; the room and tables are rebuilt
  // from the stored size and tables so every colour shows up at once.
  setTheme(theme) {
    if (this.theme === theme) return;
    const floorChanged = !this.theme || this.theme.floor !== theme.floor || this.theme.floorPattern !== theme.floorPattern;
    this.theme = theme;
    this.hemi.color.set(theme.lightColor);
    this.hemi.intensity = theme.lightLevel;
    if (floorChanged) {
      this.floorTex.dispose();
      this.floorTex = makeFloorTexture(theme.floor, theme.floorPattern);
    }
    if (this.roomSize) {
      const { width, depth } = this.roomSize;
      this.roomSize = null;
      this.setRoom(width, depth);
    }
  }

  // status: id -> { state: "free" | "booked" | "seated" | "cleaning" | "blocked" | "dim", guests, joinedLabel }
  // sections: id -> color
  setTables(tables, status, selectedId, sections = {}) {
    for (const obj of this.tableObjects.values()) {
      obj.group.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.isCSS2DObject) o.element.remove();
      });
    }
    this.tablesGroup.clear();
    this.tableObjects.clear();

    const th = this.theme;
    const chairMat = new THREE.MeshStandardMaterial({ color: th.chair, roughness: 0.7 });
    const backMat = new THREE.MeshStandardMaterial({ color: th.chairBack, roughness: 0.7 });
    const chairLegMat = new THREE.MeshStandardMaterial({ color: th.chairLeg, roughness: 0.7 });
    const takenMat = new THREE.MeshStandardMaterial({ color: th.chairTaken, roughness: 0.6 });
    const extraMat = new THREE.MeshStandardMaterial({ color: th.chairExtra, roughness: 0.6 });

    for (const table of tables) {
      const st = status[table.id] || { state: "free" };
      const guests = st.guests || 0;
      const selected = table.id === selectedId;
      const group = buildTable(table, selected ? th.tableSelected : th.tableTop, th.tableLeg);
      group.add(buildRing(table, th.status[st.state]));
      // A booking may bring extra chairs (up to the table's max) for its duration.
      const chairs = Math.max(table.seats, guests);
      chairSlots(table, chairs).forEach((slot, i) => {
        const mat = i >= table.seats ? extraMat : i < guests ? takenMat : chairMat;
        const chair = makeChair(mat, mat === chairMat ? backMat : mat, chairLegMat);
        chair.position.set(slot.x, 0, slot.z);
        chair.rotation.y = slot.rot;
        group.add(chair);
      });
      group.position.set(table.x, 0, table.z);
      group.rotation.y = table.rot || 0;
      group.userData.tableId = table.id;

      const tag = document.createElement("div");
      tag.className = `rs-tag is-${st.state}${selected ? " is-selected" : ""}`;
      tag.textContent = st.guests ? `${table.label} · ${guests}/${chairs}` : `${table.label} · ${table.seats}`;
      if (st.joinedLabel) tag.textContent += ` ⟷ ${st.joinedLabel}`;
      // The server section shows as a coloured edge on the tag.
      if (sections[table.section]) tag.style.boxShadow = `inset 4px 0 0 ${sections[table.section]}`;
      tag.addEventListener("click", () => this.onSelect(table.id));
      const label = new CSS2DObject(tag);
      label.position.set(0, 1.35, 0);
      group.add(label);

      this.tablesGroup.add(group);
      this.tableObjects.set(table.id, { group, table });
    }
  }

  setEditable(v) {
    this.editable = v;
  }

  pick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.tablesGroup.children, true);
    for (const hit of hits) {
      let o = hit.object;
      while (o && o.userData.tableId === undefined) o = o.parent;
      if (o) return o;
    }
    // Anywhere on the floor inside a table's ring counts as that table too,
    // including the gaps between its chairs.
    const p = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.floorPlane, p)) return null;
    for (const { group, table } of this.tableObjects.values()) {
      const local = group.worldToLocal(p.clone());
      const sz = preset(table.shape, table.size);
      const inside =
        table.shape === "round"
          ? Math.hypot(local.x, local.z) <= sz.d / 2 + 0.75
          : Math.abs(local.x) <= (sz.w + 1.5) / 2 && Math.abs(local.z) <= (sz.d + 1.5) / 2;
      if (inside) return group;
    }
    return null;
  }

  handleDown(e) {
    const obj = this.pick(e);
    this.downAt = { x: e.clientX, y: e.clientY, obj };
    if (obj && this.editable) {
      const p = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.floorPlane, p);
      this.drag = { obj, offset: p.sub(obj.position), moved: false };
      this.controls.enabled = false;
    }
  }

  handleMove(e) {
    if (!this.drag) {
      this.renderer.domElement.style.cursor = this.pick(e) ? (this.editable ? "grab" : "pointer") : "";
      return;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const p = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.floorPlane, p)) return;
    p.sub(this.drag.offset);
    const { table } = this.tableObjects.get(this.drag.obj.userData.tableId);
    const m = footprint(table) * 0.8;
    const { width, depth } = this.roomSize;
    p.x = THREE.MathUtils.clamp(p.x, -width / 2 + m, width / 2 - m);
    p.z = THREE.MathUtils.clamp(p.z, -depth / 2 + m, depth / 2 - m);
    // Snap to a 25cm grid so layouts stay tidy.
    p.x = Math.round(p.x * 4) / 4;
    p.z = Math.round(p.z * 4) / 4;
    // Stop at the last free spot instead of sliding into another table.
    // (Moving away is always allowed, so tables that already overlap can be pulled apart.)
    const r = footprint(table);
    const cur = this.drag.obj.position;
    for (const [id, other] of this.tableObjects) {
      if (id === table.id) continue;
      const o = other.group.position;
      const next = Math.hypot(o.x - p.x, o.z - p.z);
      if (next < (r + footprint(other.table)) * 0.75 && next < Math.hypot(o.x - cur.x, o.z - cur.z)) return;
    }
    this.drag.obj.position.set(p.x, 0, p.z);
    this.drag.moved = true;
    this.renderer.domElement.style.cursor = "grabbing";
  }

  handleUp(e) {
    const down = this.downAt;
    this.downAt = null;
    if (this.drag) {
      const { obj, moved } = this.drag;
      this.drag = null;
      this.controls.enabled = true;
      if (moved) {
        this.onMove(obj.userData.tableId, obj.position.x, obj.position.z);
        return;
      }
    }
    if (!down || e.target !== this.renderer.domElement) return;
    // A click, not an orbit drag.
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
    this.onSelect(down.obj ? down.obj.userData.tableId : null);
  }

  flyTo(pos, target) {
    this.camTween = {
      start: performance.now(),
      fromPos: this.camera.position.clone(),
      toPos: new THREE.Vector3(...pos),
      fromTarget: this.controls.target.clone(),
      toTarget: new THREE.Vector3(...target),
    };
  }

  // Camera presets. "angle" and "top" frame the whole room in the visible part
  // of the canvas (minus any panel inset and the overlay bars), so it fills big
  // laptop screens without cutting any wall off.
  view(kind) {
    this.lastView = kind;
    const { depth } = this.roomSize;
    if (kind === "walk") return this.flyTo([0, EYE_H, depth / 2 - 0.4], [0, EYE_H - 0.15, depth / 2 - 3]);
    const dir = kind === "top" ? new THREE.Vector3(0, 1, 0.0008) : new THREE.Vector3(0.5, 0.78, 0.9);
    const d = this.fitDistance(dir.normalize());
    this.flyTo([dir.x * d, dir.y * d, dir.z * d], [0, 0, 0]);
  }

  // Smallest distance along `dir` (looking at the room centre) at which every
  // corner of the room, walls included, lands inside the free part of the canvas.
  fitDistance(dir) {
    const { width, depth } = this.roomSize;
    const { clientWidth: w, clientHeight: h } = this.container;
    const { left = 0, right = 0, bottom = 0 } = this.inset || {};
    // Allowed area in normalised device coordinates, with room for the top
    // buttons and the legend.
    const minX = -1 + (2 * left) / w + 0.06;
    const maxX = 1 - (2 * right) / w - 0.06;
    const minY = -1 + (2 * bottom) / h + (bottom ? 0.06 : 0.16);
    const maxY = 1 - 0.18;
    const corners = [];
    for (const x of [-width / 2, width / 2]) for (const z of [-depth / 2, depth / 2]) for (const y of [0, WALL_H]) corners.push(new THREE.Vector3(x, y, z));
    const cam = this.camera.clone();
    const fits = (dist) => {
      cam.position.copy(dir).multiplyScalar(dist);
      cam.lookAt(0, 0, 0);
      cam.updateMatrixWorld();
      return corners.every((c) => {
        const p = c.clone().project(cam);
        return p.z < 1 && p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
      });
    };
    let lo = 1;
    let hi = 300;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) hi = mid;
      else lo = mid;
    }
    return hi;
  }



  // A wall fades out while the camera is on its outer side, so it never hides the room.
  fadeWalls() {
    if (!this.walls) return;
    const cam = this.camera.position;
    for (const s of Object.values(this.walls)) {
      // Fade a little before the inner face too, so the camera never sits inside a wall.
      const edge = s.limit - Math.sign(s.limit) * 0.35;
      const outside = s.limit < 0 ? cam[s.axis] < edge : cam[s.axis] > edge;
      const target = outside ? 0 : 1;
      if (Math.abs(s.opacity - target) < 0.005) continue;
      s.opacity += (target - s.opacity) * 0.2;
      // Walls are always see-through glass; a wall in front of the camera fades
      // almost completely, and its baseboard goes with it.
      const [wall, trim] = s.mats;
      wall.opacity = WALL_OPACITY.blocking + (WALL_OPACITY.normal - WALL_OPACITY.blocking) * s.opacity;
      trim.opacity = 0.15 + 0.85 * s.opacity;
      trim.depthWrite = s.opacity > 0.95;
    }
  }


  // Look at the table from inside the room: the camera stands on the side
  // facing the room centre, kept clear of the walls.
  focusTable(id) {
    const obj = this.tableObjects.get(id);
    if (!obj) return;
    const { x, z } = obj.group.position;
    const { width, depth } = this.roomSize;
    let dx = -x;
    let dz = -z;
    const len = Math.hypot(dx, dz);
    if (len < 0.5) {
      dx = 0;
      dz = 1;
    } else {
      dx /= len;
      dz /= len;
    }
    // Look from slightly to one side so the chairs read in 3D, not head-on.
    const a = 0.35;
    const vx = dx * Math.cos(a) - dz * Math.sin(a);
    const vz = dx * Math.sin(a) + dz * Math.cos(a);
    // Bigger tables need more distance to fit in the frame.
    const dist = footprint(obj.table) + 2.2;
    const m = 0.6;
    const cx = THREE.MathUtils.clamp(x + vx * dist, -width / 2 + m, width / 2 - m);
    const cz = THREE.MathUtils.clamp(z + vz * dist, -depth / 2 + m, depth / 2 - m);
    this.flyTo([cx, 2.3, cz], [x, 0.6, z]);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener("pointerdown", this._down);
    el.removeEventListener("pointermove", this._move);
    window.removeEventListener("pointerup", this._up);
    this.controls.dispose();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
    });
    this.renderer.dispose();
    el.remove();
    this.labels.domElement.remove();
  }
}
