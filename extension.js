/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
const { Gio, GObject, St, GLib } = imports.gi;

const Main = imports.ui.main;
const Slider = imports.ui.slider;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const SystemMenu = Main.panel.statusArea.aggregateMenu.menu;

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.SystemIndicator {
    _init() {
      super._init(1);

      const icon = new St.Icon({
        icon_name: "display-brightness-symbolic",
        style_class: "popup-menu-icon",
      });

      this._slider = new Slider.Slider(0);
      this._slider.value = 100;
      this._sliderChangedId = this._slider.connect(
        "notify::value",
        this._sliderChanged.bind(this)
      );

      this._item = new PopupMenu.PopupBaseMenuItem({ activate: false });

      this._item.connect("button-press-event", (actor, event) => {
        return this._slider.startDragging(event);
      });
      this._item.connect("key-press-event", (actor, event) => {
        return this._slider.emit("key-press-event", event);
      });
      this._item.connect("scroll-event", (actor, event) => {
        return this._slider.emit("scroll-event", event);
      });

      this._item.add(icon);
      this._item.add_child(this._slider);

      SystemMenu.addMenuItem(this._item, 2);
    }

    _sliderChanged() {
      let percent = this._slider.value;
      GLib.spawn_command_line_sync(
        `xrandr --output HDMI-1 --brightness ${percent}`
      );
    }
  }
);

function enable() {
  const indicator = new Indicator();
  Main.panel.addToStatusArea("indicator", indicator, 1);
}

function disable() {
  indicator.destroy();
}
