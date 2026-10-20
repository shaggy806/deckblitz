/**
 * Strixhaven: School of Mages, group d — the clause most likely to be wrong
 * on each card that's more than a copy of a tested pattern.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

/** The seat casts `card` when offered, free, with no targets — once. */
function castWhenOffered(seat: ScriptedController, card: ObjectId): void {
  let done = false;
  seat.chooseCastNowFn = (_view, offer) => {
    if (done || !offer.cards.includes(card)) return null;
    done = true;
    const way = offer.casts.find((c) => c.card === card)!;
    return { type: "cast-spell", player: seat.playerId, card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
}

describe("Witherbloom Command", () => {
  it("mills the target player, then returns a land card from your own graveyard; drains the opponent", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const forest = toGraveyard(game, "Forest");
    const bYard = graveyard(game, B).length;
    pickFromZone(a, forest);
    cast(game, toHand(game, "Witherbloom Command"), { modes: [0, 3], targets: [ref(B), ref(B)] });
    expect(graveyard(game, B).length).toBe(bYard + 3);
    expect(zone(game, forest)).toBe("hand");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("with no land card in your graveyard, the mill still happens and nothing returns", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const command = toHand(game, "Witherbloom Command");
    const before = hand(game, A).length;
    const bYard = graveyard(game, B).length;
    cast(game, command, { modes: [0, 3], targets: [ref(B), ref(B)] });
    expect(graveyard(game, B).length).toBe(bYard + 3);
    expect(hand(game, A).length).toBe(before - 1);
    expect(life(game, B)).toBe(18);
  });

  it("targeting yourself, a land card just milled can come back", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const before = hand(game, A).length;
    const yard = graveyard(game, A).length;
    const fatty = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Witherbloom Command"), { modes: [0, 2], targets: [ref(A), ref(fatty)] });
    // The Command came and went; one of the three milled Wastes returned.
    expect(hand(game, A).length).toBe(before + 1);
    expect(hand(game, A).every((id) => game.state.objects[id].cardName === "Wastes")).toBe(true);
    // Three milled, one returned, the Command itself.
    expect(graveyard(game, A).length).toBe(yard + 3 - 1 + 1);
    expect(pt(game, fatty)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Emergent Sequence", () => {
  it("the found land becomes a 0/0 green and blue Fractal land creature with a counter per land entered this turn", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const before = named(game, "Wastes", A).length;
    enter(game, "Forest");
    pickFromZone(a, game.state.zones.perPlayer[A].library[0]);
    cast(game, toHand(game, "Emergent Sequence"));
    const found = named(game, "Wastes", A);
    expect(found.length).toBe(before + 1);
    const land = found[found.length - 1];
    expect(types(game, land)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, land)).toContain("Fractal");
    expect(game.state.objects[land].tapped).toBe(true);
    // The Forest that entered earlier and the found Wastes (the ruling).
    expect(counters(game, land)).toBe(2);
    expect(pt(game, land)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Mentor's Guidance", () => {
  it("copies itself only while you control a Wizard (or the like)", () => {
    const { game } = table();
    lands(game, "Island", 6);
    let before = hand(game, A).length;
    cast(game, toHand(game, "Mentor's Guidance"));
    expect(hand(game, A).length).toBe(before + 1 - 1 + 1 - 1 + 1);
    spawn(game, "Prismari Pledgemage");
    before = hand(game, A).length;
    const guidance = toHand(game, "Mentor's Guidance");
    cast(game, guidance);
    // The card itself (+1 then −1) and two draws, the copy's and its own.
    expect(hand(game, A).length).toBe(before + 2);
  });
});

describe("Mage Duel", () => {
  it("costs {2} less only after another instant or sorcery this turn, then pumps and fights", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    expect(() => cast(game, toHand(game, "Mage Duel"), { targets: [ref(bears), ref(giant)] })).toThrow();
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Mage Duel"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 7 });
  });
});

describe("Mascot Interception", () => {
  it("costs {3} less aimed at a creature token, and steals, untaps and pumps it", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Mascot Interception"), { targets: [ref(bears)] })).toThrow();
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const soldier = named(game, "Soldier Token", B)[0];
    game.state.objects[soldier].tapped = true;
    cast(game, toHand(game, "Mascot Interception"), { targets: [ref(soldier)] });
    expect(game.state.objects[soldier].controller).toBe(A);
    expect(game.state.objects[soldier].tapped).toBe(false);
    expect(pt(game, soldier)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Sparring Regimen", () => {
  it("whenever you attack, a +1/+1 counter on the target attacker, and it untaps", () => {
    const { game, a } = table();
    spawn(game, "Sparring Regimen");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(life(game, B)).toBe(17);
  });
});

describe("Efreet Flamepainter", () => {
  it("casts an instant or sorcery from your graveyard free on combat damage, then exiles it", () => {
    const { game, a } = table();
    const efreet = spawn(game, "Efreet Flamepainter");
    const divination = toGraveyard(game, "Divination");
    const before = hand(game, A).length;
    pickTargets(a, divination);
    castWhenOffered(a, divination);
    attack(game, a, [efreet]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, divination)).toBe("exile");
    expect(hand(game, A).length).toBe(before + 2);
  });
});

describe("Bookwurm and Fuming Effigy", () => {
  it("Bookwurm goes third from the top from the graveyard; its leaving pings each opponent", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Fuming Effigy");
    lands(game, "Forest", 3);
    const wurm = toGraveyard(game, "Bookwurm");
    activate(game, wurm, 0);
    expect(zone(game, wurm)).toBe("library");
    expect(game.state.zones.perPlayer[A].library.indexOf(wurm)).toBe(2);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Dueling Coach", () => {
  it("enters putting a counter on a creature, then grows only creatures you control that have one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    const coach = enter(game, "Dueling Coach");
    expect(counters(game, bears)).toBe(1);
    lands(game, "Plains", 5);
    activate(game, coach, 0);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, giant)).toBe(0);
    expect(counters(game, coach)).toBe(0);
  });
});

describe("Prismari Pledgemage", () => {
  it("can attack the turn you cast an instant", () => {
    const { game, a } = table();
    const mage = spawn(game, "Prismari Pledgemage");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    attack(game, a, [mage]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Make Your Mark", () => {
  it("+1/+0, and a 3/2 Spirit when that creature dies this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Make Your Mark"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    destroy(game, bears);
    expect(tokensNamed(game, "Spirit Token (Red-White)", A)).toBe(1);
  });
});

describe("Teach by Example", () => {
  it("copies the next instant cast this turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Teach by Example"));
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });
});
