// Batch 323: the seven cards B322's re-triage found the engine could run
// (EDHREC ranks 4670–9404), each test settling the point its B322 record named.

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const onBattlefield = (game: Game, name: string, player: PlayerId): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === name && game.state.objects[id].controller === player,
  );

describe("Displaced Dinosaurs", () => {
  it("a historic permanent of yours enters as a 7/7 Dinosaur creature, keeping its other types", () => {
    const { game } = table();
    spawn(game, "Displaced Dinosaurs");
    const ring = enter(game, "Sol Ring");
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, ring)).toContain("Dinosaur");
    expect(pt(game, ring)).toEqual({ power: 7, toughness: 7 });
  });

  it("leaves a nonhistoric permanent, and an opponent's historic one, as they are", () => {
    const { game } = table();
    spawn(game, "Displaced Dinosaurs");
    const bears = enter(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    const theirs = enter(game, "Sol Ring", B);
    expect(types(game, theirs)).not.toContain("creature");
  });
});

describe("Gilraen, Dúnedain Protector", () => {
  it("returned now: back at once, without the counters, and the end step brings nothing", () => {
    const { game, a } = table();
    const gilraen = spawn(game, "Gilraen, Dúnedain Protector");
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    activate(game, gilraen, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "vigilance")).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "vigilance")).toBe(0);
    expect(counters(game, bears, "lifelink")).toBe(0);
  });

  it("not returned: back at the next end step with a vigilance and a lifelink counter", () => {
    const { game, a } = table();
    const gilraen = spawn(game, "Gilraen, Dúnedain Protector");
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    activate(game, gilraen, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "vigilance")).toBe(1);
    expect(counters(game, bears, "lifelink")).toBe(1);
    expect(keywords(game, bears)).toEqual(expect.objectContaining(new Set(["vigilance", "lifelink"])));
  });
});

describe("Faramir, Prince of Ithilien", () => {
  /** Faramir's end-step trigger chooses bob; then bob's turn, attacking with
   * `attackers` (at alice), to his end step's delayed ability resolved. */
  function bobsTurn(attackWith: boolean): { game: Game; handBefore: number } {
    const { game, b } = table();
    spawn(game, "Faramir, Prince of Ithilien");
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "end");
    settle(game);
    nextTurn(game);
    b.declareAttackersFn = () => (attackWith ? [{ attacker: bears, defender: A }] : []);
    const handBefore = hand(game).length;
    toStep(game, "end", B);
    settle(game);
    return { game, handBefore };
  }

  it("draws a card if the chosen opponent didn't attack you that turn", () => {
    const { game, handBefore } = bobsTurn(false);
    expect(hand(game)).toHaveLength(handBefore + 1);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);
  });

  it("creates three Human Soldiers if they did", () => {
    const { game, handBefore } = bobsTurn(true);
    expect(life(game)).toBe(18);
    expect(hand(game)).toHaveLength(handBefore);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(3);
  });
});

describe("Olivia, Crimson Bride", () => {
  it("returns a creature card tapped and attacking, exiled once you control no legendary Vampire", () => {
    const { game, a } = table();
    const olivia = spawn(game, "Olivia, Crimson Bride");
    const bears = toGraveyard(game, "Grizzly Bears");
    attack(game, a, [olivia]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    // Olivia's 3 and the Bears' 2: the Bears came in attacking.
    expect(life(game, B)).toBe(15);
    // The granted state trigger hasn't fired while Olivia is here.
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, olivia);
    expect(zone(game, bears)).toBe("exile");
  });

  it("another legendary Vampire keeps it", () => {
    const { game, a } = table();
    const olivia = spawn(game, "Olivia, Crimson Bride");
    spawn(game, "Edgar Markov");
    const bears = toGraveyard(game, "Grizzly Bears");
    attack(game, a, [olivia]);
    destroy(game, olivia);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Perplexing Chimera", () => {
  it("exchanges itself for an opponent's spell, and you choose the spell's new targets", () => {
    const { game, a } = table();
    const chimera = spawn(game, "Perplexing Chimera");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    pickModes(a, 0);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || quiet(s));
    expect(controller(game, chimera)).toBe(B);
    expect(controller(game, bolt)).toBe(A);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    expect(awaiting?.player).toBe(A);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(B)] });
    game.advanceUntil(quiet);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
    expect(controller(game, chimera)).toBe(B);
  });

  it("declined: nothing changes hands", () => {
    const { game, a } = table();
    const chimera = spawn(game, "Perplexing Chimera");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    pickModes(a);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(controller(game, chimera)).toBe(A);
    expect(life(game, A)).toBe(17);
  });
});

describe("Arlinn, the Pack's Hope // Arlinn, the Moon's Fury", () => {
  it("+1: creature spells with flash and an extra +1/+1 counter, until your next turn, after Arlinn is gone", () => {
    const { game } = table();
    const arlinn = spawn(game, "Arlinn, the Pack's Hope");
    loyalty(game, arlinn, 1);
    destroy(game, arlinn);
    toStep(game, "end");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
    // An opponent's creature doesn't get one.
    const theirs = enter(game, "Grizzly Bears", B);
    expect(counters(game, theirs)).toBe(0);
  });

  it("a creature entering after your next turn begins gets no counter", () => {
    const { game } = table();
    const arlinn = spawn(game, "Arlinn, the Pack's Hope");
    loyalty(game, arlinn, 1);
    nextTurn(game);
    nextTurn(game);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(0);
  });

  it("the Moon's Fury's 0: a 5/5 Werewolf creature, no longer a planeswalker, until end of turn", () => {
    const { game } = table();
    // At night, a daybound permanent enters nightbound face up.
    game.state.dayNight = "night";
    const arlinn = enter(game, "Arlinn, the Pack's Hope");
    game.state.objects[arlinn].counters.loyalty = 4;
    // The Moon's Fury's abilities: +2 is 0, the 0 is 1.
    activate(game, arlinn, 1);
    expect(types(game, arlinn)).toEqual(["creature"]);
    expect(subtypes(game, arlinn)).toEqual(["Werewolf"]);
    expect(supertypes(game, arlinn)).toEqual(["legendary"]);
    expect(pt(game, arlinn)).toEqual({ power: 5, toughness: 5 });
    expect([...keywords(game, arlinn)]).toEqual(expect.arrayContaining(["trample", "indestructible", "haste"]));
    // Its loyalty counters stay (rule 205.1a), for when it's a planeswalker again.
    expect(counters(game, arlinn, "loyalty")).toBe(4);
    nextTurn(game);
    expect(types(game, arlinn)).toEqual(["planeswalker"]);
  });

  it("the Moon's Fury's +2 adds {R}{G}", () => {
    const { game } = table();
    game.state.dayNight = "night";
    const arlinn = enter(game, "Arlinn, the Pack's Hope");
    game.state.objects[arlinn].counters.loyalty = 4;
    activate(game, arlinn, 0);
    expect(counters(game, arlinn, "loyalty")).toBe(6);
    expect(game.state.players[A].manaPool.map((u) => u.type).sort()).toEqual(["G", "R"]);
  });
});

describe("Vaevictis Asmadi, the Dire", () => {
  it("each player sacrifices the permanent chosen for them, then puts the top card onto the battlefield if it's a permanent card", () => {
    const { game, a } = table();
    const vaevictis = spawn(game, "Vaevictis Asmadi, the Dire");
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears", B);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    const wastesBefore = onBattlefield(game, "Wastes", A).length;
    pickTargets(a, ring, bears);
    attack(game, a, [vaevictis]);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    // Alice's top card, a Wastes, entered; Bob's, an instant, stayed on top.
    expect(onBattlefield(game, "Wastes", A)).toHaveLength(wastesBefore + 1);
    expect(zone(game, bolt)).toBe("library");
    expect(game.state.zones.perPlayer[B].library[0]).toBe(bolt);
  });

  it("a player whose permanent was no longer there to sacrifice reveals nothing", () => {
    const { game, a } = table();
    const vaevictis = spawn(game, "Vaevictis Asmadi, the Dire");
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears", B);
    const bobsTop = toLibrary(game, "Grizzly Bears", B);
    pickTargets(a, ring, bears);
    a.declareAttackersFn = () => [{ attacker: vaevictis, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    toStep(game, "postcombat-main");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bobsTop)).toBe("library");
  });

  it("the revealed permanents enter together: one doesn't see another enter (rule 101.4)", () => {
    const { game, a } = table();
    const vaevictis = spawn(game, "Vaevictis Asmadi, the Dire");
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears", B);
    // Alice's top card would have Bob's creatures enter tapped — but it
    // enters with Bob's, not before it.
    const obedience = toLibrary(game, "Blind Obedience");
    const bobsTop = toLibrary(game, "Grizzly Bears", B);
    pickTargets(a, ring, bears);
    attack(game, a, [vaevictis]);
    expect(zone(game, obedience)).toBe("battlefield");
    expect(zone(game, bobsTop)).toBe("battlefield");
    expect(game.state.objects[bobsTop].tapped).toBe(false);
  });
});
