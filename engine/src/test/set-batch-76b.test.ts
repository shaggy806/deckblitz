/**
 * Set walk batch 76, part b (2026-10-15): Secrets of Strixhaven (SOS), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** The prepare spell copies in exile. */
const preparedCopies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);
/** Alice gains a life, so infusion is on this turn. */
function gainALife(game: Game): void {
  game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
  settle(game);
}

describe("Foolish Fate", () => {
  it("destroys the creature; its controller loses 3 life only if you gained life this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Foolish Fate"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    gainALife(game);
    const other = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Foolish Fate"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(21);
  });
});

describe("Garrison Excavator", () => {
  it("makes one 2/2 Spirit per batch of cards leaving your graveyard, not an opponent's", () => {
    const { game } = table();
    spawn(game, "Garrison Excavator");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(tokensNamed(game, "Spirit Token (Red-White 2/2)")).toBe(1);
    const [spirit] = named(game, "Spirit Token (Red-White 2/2)");
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 2 });
    toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(tokensNamed(game, "Spirit Token (Red-White 2/2)")).toBe(1);
  });
});

describe("Wild Hypothesis", () => {
  it("makes a Fractal with X +1/+1 counters, then surveils 2", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Wild Hypothesis"), { x: 3 });
    const [fractal] = named(game, "Fractal Token");
    expect(counters(game, fractal)).toBe(3);
    expect(pt(game, fractal)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Follow the Lumarets", () => {
  function look(gained: boolean): { max: number; took: number } {
    const { game, a } = table({ deck: "Grizzly Bears" });
    lands(game, "Forest", 2);
    if (gained) gainALife(game);
    const seen = { max: -1 };
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      seen.max = max;
      return eligible.slice(0, max);
    };
    const before = hand(game).length;
    cast(game, toHand(game, "Follow the Lumarets"));
    return { max: seen.max, took: hand(game).length - before };
  }

  it("takes up to one creature or land card", () => {
    expect(look(false)).toEqual({ max: 1, took: 1 });
  });

  it("with infusion, takes up to two", () => {
    expect(look(true)).toEqual({ max: 2, took: 2 });
  });
});

describe("Together as One", () => {
  it("X is the colors spent: target player draws X, X damage to any target, you gain X", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 3);
    const card = toHand(game, "Together as One");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(A), ref(B)] });
    // The spell left the hand; three cards came in.
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});

describe("Fractal Anomaly", () => {
  it("puts a counter on the Fractal for each card you've drawn this turn", () => {
    const { game } = table();
    lands(game, "Island", 1);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    // The draw step's card and these two.
    expect(game.state.players[A].cardsDrawnThisTurn).toBe(3);
    cast(game, toHand(game, "Fractal Anomaly"));
    const [fractal] = named(game, "Fractal Token");
    expect(counters(game, fractal)).toBe(3);
  });
});

describe("Encouraging Aviator // Jump", () => {
  it("becomes prepared as it attacks; the Jump copy gives a creature flying and unprepares it", () => {
    const { game, a } = table();
    const aviator = spawn(game, "Encouraging Aviator");
    expect(game.state.objects[aviator].prepared).toBeUndefined();
    attack(game, a, [aviator], B);
    expect(game.state.objects[aviator].prepared).toBeDefined();
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Jump");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    cast(game, copy, { via: "prepared", targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(game.state.objects[aviator].prepared).toBeUndefined();
  });
});

describe("Infirmary Healer // Stream of Life", () => {
  it("enters prepared; the Stream of Life copy gives target player X life", () => {
    const { game } = table();
    const healer = enter(game, "Infirmary Healer");
    expect(game.state.objects[healer].prepared).toBeDefined();
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Stream of Life");
    lands(game, "Forest", 4);
    cast(game, copy, { via: "prepared", targets: [ref(B)], x: 3 });
    expect(life(game, B)).toBe(23);
    expect(game.state.objects[healer].prepared).toBeUndefined();
  });

  it("Stream of Life is a card of its own", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Stream of Life"), { targets: [ref(A)], x: 2 });
    expect(life(game, A)).toBe(22);
  });
});

describe("Pterafractyl", () => {
  it("enters with X +1/+1 counters and gains you 2 life", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Pterafractyl"), { x: 2 });
    const [ptera] = named(game, "Pterafractyl");
    expect(counters(game, ptera)).toBe(2);
    expect(pt(game, ptera)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, ptera).has("flying")).toBe(true);
    expect(life(game, A)).toBe(22);
  });

  it("cast for X = 0 it dies, the life still gained", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const card = toHand(game, "Pterafractyl");
    cast(game, card, { x: 0 });
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game, A)).toBe(22);
  });
});

describe("Dig Site Inventory", () => {
  it("puts a +1/+1 counter and grants vigilance, and has flashback {W}", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Dig Site Inventory");
    cast(game, card, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(zone(game, card)).toBe("graveyard");
    cast(game, card, { targets: [ref(bears)], via: "flashback" });
    expect(counters(game, bears)).toBe(2);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Pestbrood Sloth", () => {
  it("makes two attacking-lifegain Pests when it dies", () => {
    const { game } = table();
    const sloth = spawn(game, "Pestbrood Sloth");
    expect(keywords(game, sloth).has("reach")).toBe(true);
    destroy(game, sloth);
    expect(tokensNamed(game, "Pest Token (Attacks)")).toBe(2);
  });
});

describe("Efflorescence", () => {
  it("puts two +1/+1 counters; trample and indestructible only with infusion", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Efflorescence"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
    expect(keywords(game, bears).has("trample")).toBe(false);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    gainALife(game);
    cast(game, toHand(game, "Efflorescence"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(4);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });
});

describe("Dissection Practice", () => {
  it("drains 1 and gives up to one creature +1/+1 and up to one -1/-1", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Dissection Practice"), { targets: [ref(B), ref(mine), ref(theirs)] });
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });

  it("both creature slots may be left empty", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Dissection Practice"), { targets: [ref(B), null, null] });
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("Ajani's Response", () => {
  it("costs {3} less aimed at a tapped creature", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const untapped = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Ajani's Response"), { targets: [ref(untapped)] })).toThrow();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Ajani's Response"), { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
  });
});

describe("Artistic Process", () => {
  it("deals 6 damage to target creature", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Artistic Process"), { modes: [0], targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("deals 2 damage to each creature you don't control", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Artistic Process"), { modes: [1] });
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("makes a 3/3 flying Elemental that has haste this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Artistic Process"), { modes: [2] });
    const [elemental] = named(game, "Elemental Token (3/3 Blue-Red Flying)");
    expect(pt(game, elemental)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, elemental).has("flying")).toBe(true);
    expect(keywords(game, elemental).has("haste")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(keywords(game, elemental).has("haste")).toBe(false);
  });
});

describe("Scolding Administrator", () => {
  it("repartee: grows when you cast an instant or sorcery that targets a creature", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const admin = spawn(game, "Scolding Administrator");
    expect(keywords(game, admin).has("menace")).toBe(true);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, admin)).toBe(0);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(counters(game, admin)).toBe(1);
  });

  it("dying with counters, puts the same counters on up to one target creature", () => {
    const { game, a } = table();
    const admin = spawn(game, "Scolding Administrator");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[admin].counters["+1/+1"] = 2;
    a.chooseTargetsFn = () => [ref(bears)];
    destroy(game, admin);
    expect(counters(game, bears)).toBe(2);
  });

  it("without counters, doesn't trigger", () => {
    const { game, a } = table();
    const admin = spawn(game, "Scolding Administrator");
    // Two options, so a trigger would have to ask.
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [null];
    };
    destroy(game, admin);
    expect(asked).toBe(0);
  });
});
