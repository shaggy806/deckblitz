/**
 * Mercadian Masques' rest (B233), group E. One test per card whose behaviour
 * is more than a stat line or an exact copy of an already-tested pattern, on
 * the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Deepwood Legate", () => {
  it("is free only while an opponent controls a Forest and you control a Swamp", () => {
    const { game } = table();
    const card = toHand(game, "Deepwood Legate");
    const freeOffered = (): boolean =>
      game.legalActions(A).some((act) => act.kind === "cast-spell" && act.card === card && act.free === true);
    spawn(game, "Swamp");
    expect(freeOffered()).toBe(false);
    spawn(game, "Forest", B);
    expect(freeOffered()).toBe(true);
    cast(game, card, { free: true });
    expect(zone(game, card)).toBe("battlefield");
  });
});

describe("Ramosian Commander", () => {
  it("puts a Rebel permanent card with mana value 5 or less onto the battlefield", () => {
    const { game, a } = table();
    const scout = toLibrary(game, "Amrou Scout");
    const commander = spawn(game, "Ramosian Commander");
    lands(game, "Plains", 6);
    pickFromZone(a, scout);
    activate(game, commander, 0);
    expect(zone(game, scout)).toBe("battlefield");
  });
});

describe("Briar Patch", () => {
  it("gives a creature attacking you -1/-0", () => {
    const { game, b } = table();
    spawn(game, "Briar Patch");
    const bears = spawn(game, "Grizzly Bears", B);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(19);
  });
});

describe("Misstep", () => {
  it("keeps the target player's creatures, and only creatures, tapped through their next untap step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const land = spawn(game, "Wastes", B, { tapped: true });
    lands(game, "Island", 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Misstep"), { targets: [ref(B)] });
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[land].tapped).toBe(false);
  });
});

describe("Customs Depot", () => {
  it("loots when you pay {1} as you cast a creature spell", () => {
    const { game, a } = table();
    spawn(game, "Customs Depot");
    lands(game, "Forest", 3);
    const bears = toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    pickModes(a, 0);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
    expect(graveyard(game).length).toBe(1);
  });
});

describe("Putrefaction", () => {
  it("makes a player who casts a green spell discard, but not one who casts a red spell", () => {
    const { game } = table();
    spawn(game, "Putrefaction");
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const shock = toHand(game, "Shock");
    const bears = toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, shock, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before - 1);
    cast(game, bears);
    expect(hand(game).length).toBe(before - 3);
  });
});

describe("Crag Saurian", () => {
  it("goes to the controller of a source that deals it damage", () => {
    const { game } = table();
    const saurian = spawn(game, "Crag Saurian");
    const shaman = spawn(game, "Anaba Shaman", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(saurian)], { source: shaman });
    settle(game);
    expect(controller(game, saurian)).toBe(B);
  });
});

describe("Orim's Cure", () => {
  it("is cast by tapping a creature while you control a Plains, and prevents the next 4 damage", () => {
    const { game } = table();
    spawn(game, "Plains");
    const bears = spawn(game, "Grizzly Bears");
    const cure = toHand(game, "Orim's Cure");
    cast(game, cure, { altCost: true, targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    game.debugApplyEffect(B, { kind: "damage", amount: 4, target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Saprazzan Outrigger", () => {
  it("is put on top of its owner's library at end of combat after attacking", () => {
    const { game, a } = table();
    const outrigger = spawn(game, "Saprazzan Outrigger");
    attack(game, a, [outrigger]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, outrigger)).toBe("library");
  });
});

describe("Megatherium", () => {
  it("is sacrificed unless you pay {1} for each card in your hand", () => {
    const { game } = table();
    const first = enter(game, "Megatherium");
    expect(zone(game, first)).toBe("graveyard");
  });

  it("stays when you pay that much", () => {
    const { game, a } = table();
    const inHand = hand(game).length;
    const wastes = lands(game, "Wastes", inHand);
    pickModes(a, 0);
    const beast = enter(game, "Megatherium");
    expect(zone(game, beast)).toBe("battlefield");
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});
