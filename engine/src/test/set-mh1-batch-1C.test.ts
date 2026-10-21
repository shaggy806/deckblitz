/**
 * Modern Horizons (MH1; B122), group C. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";
import type { BlockOffer } from "./harness.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("MH1 group C — Ice-Fang Coatl", () => {
  it("has deathtouch only with three other snow permanents, itself not counted", () => {
    const { game } = table();
    lands(game, "Snow-Covered Island", 2);
    const coatl = enter(game, "Ice-Fang Coatl");
    expect(keywords(game, coatl).has("deathtouch")).toBe(false);
    spawn(game, "Snow-Covered Forest");
    expect(keywords(game, coatl).has("deathtouch")).toBe(true);
  });
});

describe("MH1 group C — Winter's Rest", () => {
  it("taps the creature and keeps it tapped while you control another snow permanent", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Snow-Covered Island", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Winter's Rest"), { targets: [{ kind: "object", object: bears }] });
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("lets it untap with no other snow permanent", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Winter's Rest"), { targets: [{ kind: "object", object: bears }] });
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("MH1 group C — Throatseeker", () => {
  it("gives an unblocked attacking Ninja lifelink, not another attacker", () => {
    const { game, a } = table();
    const seeker = spawn(game, "Throatseeker");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, seeker).has("lifelink")).toBe(false);
    attack(game, a, [seeker, bears]);
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(23);
  });
});

describe("MH1 group C — Tempered Sliver and Lancer Sliver", () => {
  it("gives another Sliver first strike and a counter when it hits a player", () => {
    const { game, a } = table();
    spawn(game, "Tempered Sliver");
    const lancer = spawn(game, "Lancer Sliver");
    expect(keywords(game, lancer).has("first-strike")).toBe(true);
    attack(game, a, [lancer]);
    expect(life(game, B)).toBe(18);
    expect(counters(game, lancer)).toBe(1);
  });
});

describe("MH1 group C — Scuttling Sliver", () => {
  it("gives another Sliver \"{2}: Untap this creature\"", () => {
    const { game } = table();
    spawn(game, "Scuttling Sliver");
    const lancer = spawn(game, "Lancer Sliver", A, { tapped: true });
    lands(game, "Wastes", 2);
    activate(game, lancer, 0);
    expect(game.state.objects[lancer].tapped).toBe(false);
  });
});

describe("MH1 group C — Sadistic Obsession", () => {
  it("gives the enchanted creature a {B}, {T} -1/-1 counter ability", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Sadistic Obsession");
    game.state.objects[aura].attachedTo = bears;
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    activate(game, bears, 0, { targets: [{ kind: "object", object: theirs }] });
    expect(counters(game, theirs, "-1/-1")).toBe(1);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("MH1 group C — Amorphous Axe", () => {
  it("makes the equipped creature every creature type, so a Sliver lord reaches it", () => {
    const { game } = table();
    spawn(game, "Lancer Sliver");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    const axe = spawn(game, "Amorphous Axe");
    game.state.objects[axe].attachedTo = bears;
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });
});

describe("MH1 group C — Pyrophobia", () => {
  it("deals 3 damage and stops Cowards (a changeling too) from blocking this turn", () => {
    const { game, a } = table();
    const target = spawn(game, "Grizzly Bears", B);
    const changeling = spawn(game, "Webweaver Changeling", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    pickTargets(a, target);
    cast(game, toHand(game, "Pyrophobia"), { targets: [{ kind: "object", object: target }] });
    expect(zone(game, target)).toBe("graveyard");
    const offer = blockOffer(game, a, [attacker]);
    expect(canBlock(offer, changeling)).toEqual([]);
    expect(canBlock(offer, bears)).toEqual([attacker]);
  });
});

describe("MH1 group C — Quakefoot Cyclops", () => {
  it("cycled, makes target creature unable to block this turn", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    const card = toHand(game, "Quakefoot Cyclops");
    const before = hand(game).length;
    pickTargets(a, theirs);
    game.dispatch({ type: "cycle", player: A, card });
    settle(game);
    expect(hand(game).length).toBe(before);
    const offer = blockOffer(game, a, [attacker]);
    expect(canBlock(offer, theirs)).toEqual([]);
    expect(canBlock(offer, other)).toEqual([attacker]);
  });

  it("entering, stops up to two target creatures from blocking", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    const three = spawn(game, "Grizzly Bears", B);
    pickTargets(a, one, two);
    const cyclops = enter(game, "Quakefoot Cyclops");
    const offer = blockOffer(game, a, [cyclops]);
    expect(canBlock(offer, one)).toEqual([]);
    expect(canBlock(offer, two)).toEqual([]);
    expect(canBlock(offer, three)).toEqual([cyclops]);
  });
});

describe("MH1 group C — Martyr's Soul", () => {
  it("gets two counters only if you control no tapped lands", () => {
    const { game } = table();
    const first = enter(game, "Martyr's Soul");
    expect(counters(game, first)).toBe(2);
    spawn(game, "Wastes", A, { tapped: true });
    const second = enter(game, "Martyr's Soul");
    expect(counters(game, second)).toBe(0);
  });
});

describe("MH1 group C — Webweaver Changeling", () => {
  it("gains 5 life only with three creature cards in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    enter(game, "Webweaver Changeling");
    expect(life(game, A)).toBe(20);
    toGraveyard(game, "Grizzly Bears");
    enter(game, "Webweaver Changeling");
    expect(life(game, A)).toBe(25);
  });
});

describe("MH1 group C — Stirring Address", () => {
  it("overloaded, pumps each creature you control and none of theirs", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Stirring Address"), { overload: true });
    expect(pt(game, one)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, two)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("MH1 group C — Settle Beyond Reality", () => {
  it("with both modes, exiles theirs and blinks yours", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 5);
    const moves = game.state.objects[mine].zoneChangeCount ?? 0;
    pickTargets(a, theirs, mine);
    cast(game, toHand(game, "Settle Beyond Reality"), {
      modes: [0, 1],
      targets: [
        { kind: "object", object: theirs },
        { kind: "object", object: mine },
      ],
    });
    expect(zone(game, theirs)).toBe("exile");
    // Same id, a new object (rule 400.7): it left and came back.
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].zoneChangeCount).toBeGreaterThan(moves);
  });
});

describe("MH1 group C — Ayula's Influence", () => {
  it("discards a land card to make a Bear", () => {
    const { game, a } = table();
    const influence = spawn(game, "Ayula's Influence");
    const land = toHand(game, "Forest");
    a.chooseDiscardsFn = () => [land];
    activate(game, influence, 0);
    expect(zone(game, land)).toBe("graveyard");
    expect(tokensNamed(game, "Bear Token", A)).toBe(1);
  });
});
