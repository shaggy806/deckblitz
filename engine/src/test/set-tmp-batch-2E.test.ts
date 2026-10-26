import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  nextTurn,
  zone,
} from "./harness.js";

describe("Tempest batch 2E", () => {
  it("Angelic Protector gets +0/+3 when targeted, before the spell resolves", () => {
    const { game } = table();
    const angel = spawn(game, "Angelic Protector", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("battlefield");
    expect(pt(game, angel)).toEqual({ power: 2, toughness: 5 });
  });

  it("Dread of Night shrinks white creatures only", () => {
    const { game } = table();
    spawn(game, "Dread of Night");
    const angel = spawn(game, "Angelic Protector", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Thalakos Mistfolk goes on top of its owner's library", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const mistfolk = spawn(game, "Thalakos Mistfolk");
    activate(game, mistfolk);
    expect(zone(game, mistfolk)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(mistfolk);
  });

  it("Mogg Conscripts can't attack until you've cast a creature spell this turn", () => {
    const { game, a } = table();
    const mogg = spawn(game, "Mogg Conscripts");
    attack(game, a, [mogg]);
    expect(life(game, B)).toBe(20);

    const second = table();
    const mogg2 = spawn(second.game, "Mogg Conscripts");
    lands(second.game, "Forest", 2);
    cast(second.game, toHand(second.game, "Grizzly Bears"));
    attack(second.game, second.a, [mogg2]);
    expect(life(second.game, B)).toBe(18);
  });

  it("Flowstone Sculpture's keyword lasts past the turn", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const sculpture = spawn(game, "Flowstone Sculpture");
    toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    pickModes(a, 1);
    activate(game, sculpture);
    expect(hand(game).length).toBe(before - 1);
    expect(keywords(game, sculpture).has("flying")).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(keywords(game, sculpture).has("flying")).toBe(true);
  });

  it("Crazed Armodon gets +3/+0 and trample, then is destroyed at the next end step", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const armodon = spawn(game, "Crazed Armodon");
    activate(game, armodon);
    expect(pt(game, armodon)).toEqual({ power: 6, toughness: 3 });
    expect(keywords(game, armodon).has("trample")).toBe(true);
    toStep(game, "postcombat-main");
    expect(zone(game, armodon)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, armodon)).toBe("graveyard");
  });
});
