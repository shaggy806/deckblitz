/**
 * Homelands (HML; B160) — group A.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  counters,
  destroy,
  enter,
  keywords,
  life,
  lands,
  pickModes,
  pickTargets,
  pt,
  spawn,
  toGraveyard,
  tokensNamed,
  table,
  zone,
} from "./harness.js";

describe("Sengir Autocrat", () => {
  it("makes three Serfs, and exiles every Serf token when it leaves", () => {
    const { game } = table();
    const autocrat = enter(game, "Sengir Autocrat");
    enter(game, "Sengir Autocrat", B);
    expect(tokensNamed(game, "Serf Token", A)).toBe(3);
    expect(tokensNamed(game, "Serf Token", B)).toBe(3);
    destroy(game, autocrat);
    expect(tokensNamed(game, "Serf Token")).toBe(0);
  });
});

describe("Torture", () => {
  it("puts a -1/-1 counter on the enchanted creature", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const torture = spawn(game, "Torture");
    game.state.objects[torture].attachedTo = bears;
    activate(game, torture);
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Aysen Crusader", () => {
  it("is 2 plus the Soldiers and Warriors you control", () => {
    const { game } = table();
    const crusader = spawn(game, "Aysen Crusader");
    expect(pt(game, crusader)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Elite Vanguard");
    spawn(game, "Goblin Piker");
    spawn(game, "Elite Vanguard", B);
    expect(pt(game, crusader)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Aysen Highway", () => {
  it("gives white creatures plainswalk, and only those", () => {
    const { game } = table();
    spawn(game, "Aysen Highway");
    const vanguard = spawn(game, "Elite Vanguard", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, vanguard).has("plainswalk")).toBe(true);
    expect(keywords(game, bears).has("plainswalk")).toBe(false);
  });
});

describe("Rysorian Badger", () => {
  it("unblocked, exiles two creature cards, gains 2 life and deals no combat damage", () => {
    const { game, a } = table();
    const badger = spawn(game, "Rysorian Badger");
    const one = toGraveyard(game, "Grizzly Bears", B);
    const two = toGraveyard(game, "Elite Vanguard", B);
    pickTargets(a, one, two);
    pickModes(a, 0);
    attack(game, a, [badger]);
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(20);
  });

  it("declined, deals its combat damage", () => {
    const { game, a } = table();
    const badger = spawn(game, "Rysorian Badger");
    const one = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, one);
    pickModes(a);
    attack(game, a, [badger]);
    expect(zone(game, one)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});
