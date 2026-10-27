/**
 * Recheck list R4, group E: the `block-if-able` requirement (rule 509.1c) on
 * the cards that waited for it, and a counterspell that mills the countered
 * spell's controller.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
} from "./harness.js";

describe("R4 group E", () => {
  it("Lurking Arynx: only with total power 8 or greater; then the target has to block it", () => {
    const { game, a } = table();
    const arynx = spawn(game, "Lurking Arynx");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 6);
    expect(() => activate(game, arynx, 0, { targets: [ref(bears)] })).toThrow();
    spawn(game, "Craw Wurm");
    activate(game, arynx, 0, { targets: [ref(bears)] });
    const offer = blockOffer(game, a, [arynx]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: arynx }]);
  });

  it("Monstrous Step: +7/+7, and the other target has to block that creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Monstrous Step"), { targets: [ref(bears), ref(giant)] });
    expect(pt(game, bears)).toEqual({ power: 9, toughness: 9 });
    const offer = blockOffer(game, a, [bears]);
    expect(offer.blockRequirements).toEqual([{ blocker: giant, attacker: bears }]);
  });

  it("Nacatl Hunt-Pride: the target has to block, any attacker", () => {
    const { game, a } = table();
    const pride = spawn(game, "Nacatl Hunt-Pride");
    const attacker = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    activate(game, pride, 1, { targets: [ref(bears)] });
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears }]);
  });

  it("Peema Aether-Seer: energy equal to the greatest power, and {E}{E}{E} makes a creature block", () => {
    const { game, a } = table();
    spawn(game, "Craw Wurm");
    const peema = enter(game, "Peema Aether-Seer");
    expect(game.state.players[A].energy).toBe(6);
    const attacker = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, peema, 0, { targets: [ref(bears)] });
    expect(game.state.players[A].energy).toBe(3);
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears }]);
  });

  it("Provoke: untaps the creature, which has to block; draws a card", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 2);
    const provoke = toHand(game, "Provoke");
    const before = hand(game).length;
    cast(game, provoke, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(before);
    expect(game.state.objects[bears].tapped).toBe(false);
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears }]);
  });

  it("Rimehorn Aurochs: the first target has to block the second, paid with snow mana", () => {
    const { game, a } = table();
    const aurochs = spawn(game, "Rimehorn Aurochs");
    const attacker = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Snow-Covered Forest", 3);
    activate(game, aurochs, 0, { targets: [ref(bears), ref(attacker)] });
    const offer = blockOffer(game, a, [aurochs, attacker]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker }]);
  });

  it("Shessra: the entering trigger's target has to block; at end step after a death, pay 2 life to draw", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Shessra, Death's Whisper");
    expect(game.state.blockRequirements).toHaveLength(1);
    destroy(game, spawn(game, "Hill Giant", B));
    pickModes(a, 0);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Timely Interference: -1/-0 and a card; kicked, the creature also has to block", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    const first = toHand(game, "Timely Interference");
    const before = hand(game).length;
    cast(game, first, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 2 });
    expect(hand(game).length).toBe(before);
    expect(game.state.blockRequirements).toBeUndefined();
    lands(game, "Island", 1);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Timely Interference"), { targets: [ref(bears)], kicked: true });
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
    const attacker = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears }]);
  });

  it("Turntimber Basilisk: landfall may have the target block it", () => {
    const { game, a } = table();
    const basilisk = spawn(game, "Turntimber Basilisk");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    enter(game, "Forest");
    const offer = blockOffer(game, a, [basilisk]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: basilisk }]);
  });

  it("Didn't Say Please: counters the spell, and its controller mills three", () => {
    const { game } = table();
    lands(game, "Island", 3);
    nextTurn(game);
    lands(game, "Forest", 2, B);
    const bears = toHand(game, "Grizzly Bears", B);
    cast(game, bears, { player: B, settle: false });
    game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.includes(bears));
    const library = game.state.zones.perPlayer[B].library.length;
    cast(game, toHand(game, "Didn't Say Please"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(graveyard(game, B)).toHaveLength(4);
    expect(game.state.zones.perPlayer[B].library.length).toBe(library - 3);
  });
});
