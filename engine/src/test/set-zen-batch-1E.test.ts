/**
 * Zendikar (ZEN; B165), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Eternity Vessel", () => {
  it("enters with your life total in charge counters, and landfall sets your life to them either way", () => {
    const { game, a } = table();
    const vessel = enter(game, "Eternity Vessel");
    expect(counters(game, vessel, "charge")).toBe(20);
    pickModes(a, 0);
    game.state.players[A].life = 5;
    enter(game, "Mountain");
    expect(life(game)).toBe(20);
    game.state.players[A].life = 31;
    enter(game, "Mountain");
    expect(life(game)).toBe(20);
    pickModes(a);
    game.state.players[A].life = 7;
    enter(game, "Mountain");
    expect(life(game)).toBe(7);
  });
});

describe("Mark of Mutiny", () => {
  it("steals, untaps, pumps and hastes the creature; the counter stays after it goes back", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Mark of Mutiny"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
    expect(counters(game, bears)).toBe(1);
  });
});

/** The seat casts each card in `wanted` once, free, at `target`. */
function castFromOffers(seat: ScriptedController, wanted: readonly ObjectId[]): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  const left = [...wanted];
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    const pick = left.find((id) => offer.cards.includes(id));
    if (pick === undefined) return null;
    left.splice(left.indexOf(pick), 1);
    const way = offer.casts.find((c) => c.card === pick)!;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: pick,
      targets: [ref(B)],
      via: way.via,
      ...(offer.free ? { free: true } : {}),
    };
  };
  return seen;
}

describe("Chandra Ablaze", () => {
  it("+1 deals 4 only when the card discarded is red", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra Ablaze");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    loyalty(game, chandra, 1, { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
    nextTurn(game);
    nextTurn(game);
    const divination = toHand(game, "Divination");
    a.chooseDiscardsFn = () => [divination];
    loyalty(game, chandra, 1, { targets: [ref(B)] });
    expect(zone(game, divination)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });

  it("−2 wheels every hand into three cards", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra Ablaze");
    loyalty(game, chandra, -2);
    expect(hand(game, A).length).toBe(3);
    expect(hand(game, B).length).toBe(3);
  });

  it("−7 casts any number of red instants and sorceries from the graveyard for free", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra Ablaze");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const shock = toGraveyard(game, "Shock");
    const divination = toGraveyard(game, "Divination");
    const seen = castFromOffers(a, [bolt, shock]);
    loyalty(game, chandra, -7, { atLeast: 7 });
    expect(seen.offered[0]).toContain(bolt);
    expect(seen.offered[0]).toContain(shock);
    expect(seen.offered[0]).not.toContain(divination);
    expect(life(game, B)).toBe(15);
    expect(graveyard(game)).toContain(bolt);
    expect(graveyard(game)).toContain(shock);
  });
});

describe("Runeflare Trap", () => {
  it("costs {R} once an opponent drew three cards, and deals damage equal to the target's hand", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const trap = toHand(game, "Runeflare Trap");
    expect(() => cast(game, trap, { targets: [ref(B)], altCost: true, settle: false })).toThrow();
    game.debugApplyEffect(B, { kind: "draw", amount: 3 }, []);
    const bobHand = hand(game, B).length;
    expect(hand(game, A).length).not.toBe(bobHand);
    cast(game, trap, { targets: [ref(B)], altCost: true });
    expect(life(game, B)).toBe(20 - bobHand);
    expect(life(game, A)).toBe(20);
  });
});

describe("Quest for the Gravelord", () => {
  it("counts any creature dying and cashes three counters in for a 5/5 Zombie Giant", () => {
    const { game, a } = table();
    const quest = spawn(game, "Quest for the Gravelord");
    pickModes(a, 0);
    destroy(game, spawn(game, "Grizzly Bears", B));
    destroy(game, spawn(game, "Grizzly Bears", A));
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, quest, "quest")).toBe(3);
    activate(game, quest);
    expect(zone(game, quest)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Giant Token", A)).toBe(1);
  });
});

describe("Obsidian Fireheart", () => {
  it("sets a land burning its controller each upkeep, and a burning land is no target", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const fireheart = spawn(game, "Obsidian Fireheart");
    const bobLand = spawn(game, "Mountain", B);
    activate(game, fireheart, 0, { targets: [ref(bobLand)] });
    expect(counters(game, bobLand, "blaze")).toBe(1);
    expect(() => activate(game, fireheart, 0, { targets: [ref(bobLand)], settle: false })).toThrow();
    destroy(game, fireheart);
    nextTurn(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Kor Outfitter and Kor Duelist", () => {
  it("attaches an Equipment as it enters, and the equipped Duelist has double strike", () => {
    const { game, a } = table();
    const blade = spawn(game, "Bonesplitter");
    const duelist = spawn(game, "Kor Duelist");
    expect(keywords(game, duelist).has("double-strike")).toBe(false);
    pickTargets(a, blade, duelist);
    pickModes(a, 0);
    enter(game, "Kor Outfitter");
    expect(game.state.objects[blade].attachedTo).toBe(duelist);
    expect(keywords(game, duelist).has("double-strike")).toBe(true);
  });
});

describe("Relic Crush", () => {
  it("destroys two artifacts or enchantments", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const ring = spawn(game, "Sol Ring", B);
    const stone = spawn(game, "Mind Stone", B);
    cast(game, toHand(game, "Relic Crush"), { targets: [ref(ring), ref(stone)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, stone)).toBe("graveyard");
  });
});

describe("Elemental Appeal", () => {
  it("kicked, the 7/1 gets +7/+0, and it's exiled at the end step", () => {
    const { game } = table();
    lands(game, "Mountain", 9);
    cast(game, toHand(game, "Elemental Appeal"), { kicked: true });
    const [elemental] = named(game, "Elemental Token 7/1 (Trample, Haste)", A);
    expect(pt(game, elemental)).toEqual({ power: 14, toughness: 1 });
    toStep(game, "end");
    expect(tokensNamed(game, "Elemental Token 7/1 (Trample, Haste)")).toBe(1);
    nextTurn(game);
    expect(tokensNamed(game, "Elemental Token 7/1 (Trample, Haste)")).toBe(0);
  });
});

describe("Halo Hunter", () => {
  it("destroys an Angel as it enters", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    pickTargets(a, angel);
    enter(game, "Halo Hunter");
    expect(zone(game, angel)).toBe("graveyard");
  });
});
