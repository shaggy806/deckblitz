/**
 * B251's lead cards, one or more per feature built: each player chooses then all act (Stronghold
 * Rats, Smallpox, Show and Tell, Harsh Mercy, Patriarch's Bidding, Sadistic Shell Game, Master of
 * Ceremonies), shared-graveyard and same-controller targets (Decompose, Witness the Future, Mutiny),
 * and repeat this process (Expansion Algorithm, Ad Nauseam, Grindstone).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("each player chooses, then all act", () => {
  it("Stronghold Rats: each player discards, Bob choosing before Alice's card goes", () => {
    const { game, a, b } = table();
    const rats = spawn(game, "Stronghold Rats");
    const mine = toHand(game, "Hill Giant", A);
    const bobs = toHand(game, "Grizzly Bears", B);
    a.chooseDiscardsFn = () => [mine];
    let mineWhenBobChose: string | undefined;
    b.chooseDiscardsFn = () => {
      mineWhenBobChose = zone(game, mine);
      return [bobs];
    };
    attack(game, a, [rats]);
    expect(life(game, B)).toBe(18);
    expect(mineWhenBobChose).toBe("hand");
    expect([zone(game, mine), zone(game, bobs)]).toEqual(["graveyard", "graveyard"]);
  });

  it("Smallpox: each loses 1, discards, then sacrifices a creature and then a land", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const myBears = spawn(game, "Grizzly Bears", A);
    const bobsBears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Forest", B);
    const handBefore = hand(game, B).length;
    cast(game, toHand(game, "Smallpox"));
    expect([life(game, A), life(game, B)]).toEqual([19, 19]);
    expect(hand(game, B)).toHaveLength(handBefore - 1);
    expect([zone(game, myBears), zone(game, bobsBears)]).toEqual(["graveyard", "graveyard"]);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === B)).toHaveLength(0);
  });

  it("Show and Tell: both chosen cards enter together", () => {
    const { game, a, b } = table();
    lands(game, "Island", 3);
    const warden = toHand(game, "Soul Warden", A);
    const bears = toHand(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [0];
    b.chooseModesFn = () => [0];
    a.chooseFromZoneFn = () => [warden];
    let wardenWhenBobChose: string | undefined;
    b.chooseFromZoneFn = () => {
      wardenWhenBobChose = zone(game, warden);
      return [bears];
    };
    cast(game, toHand(game, "Show and Tell"));
    expect(wardenWhenBobChose).toBe("hand");
    expect([zone(game, warden), zone(game, bears)]).toEqual(["battlefield", "battlefield"]);
    expect(game.state.objects[bears].controller).toBe(B);
    // Soul Warden saw the Bears enter beside it.
    expect(life(game, A)).toBe(21);
  });

  it("Harsh Mercy: creatures of a type someone chose survive", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const elf = spawn(game, "Elvish Visionary", B);
    a.chooseCreatureTypeFn = () => "Elf";
    b.chooseCreatureTypeFn = () => "Elf";
    cast(game, toHand(game, "Harsh Mercy"));
    expect([zone(game, bears), zone(game, giant), zone(game, elf)]).toEqual(["graveyard", "graveyard", "battlefield"]);
  });

  it("Patriarch's Bidding: every graveyard's creatures of a chosen type enter, each under its owner", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 5);
    const myBears = toGraveyard(game, "Grizzly Bears", A);
    const bobsBears = toGraveyard(game, "Grizzly Bears", B);
    const bobsGiant = toGraveyard(game, "Hill Giant", B);
    a.chooseCreatureTypeFn = () => "Bear";
    b.chooseCreatureTypeFn = () => "Wizard";
    cast(game, toHand(game, "Patriarch's Bidding"));
    expect([zone(game, myBears), zone(game, bobsBears), zone(game, bobsGiant)]).toEqual([
      "battlefield",
      "battlefield",
      "graveyard",
    ]);
    expect(game.state.objects[bobsBears].controller).toBe(B);
  });

  it("Sadistic Shell Game: from the next opponent, each player chooses a creature its caster doesn't control", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 5);
    const mine = spawn(game, "Grizzly Bears", A);
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    const order: string[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      order.push("a");
      expect(eligible).not.toContain(mine);
      return [carols];
    };
    b.choosePermanentsFn = () => {
      order.push("b");
      return [bobs];
    };
    c.choosePermanentsFn = () => {
      order.push("c");
      return [carols];
    };
    cast(game, toHand(game, "Sadistic Shell Game"));
    expect(order).toEqual(["b", "c", "a"]);
    expect([zone(game, mine), zone(game, bobs), zone(game, carols)]).toEqual(["battlefield", "graveyard", "graveyard"]);
  });

  it("Master of Ceremonies: you and each opponent who chose money create a Treasure", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Master of Ceremonies");
    b.chooseModesFn = () => [0];
    c.chooseModesFn = () => [2];
    const carolsHand = hand(game, C).length;
    game.advanceUntil((s) => s.turn.number === 4 && s.turn.step === "draw");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", C)).toBe(0);
    // Carol drew for secrets (and for her own draw step).
    expect(hand(game, C).length).toBe(carolsHand + 2);
  });
});

describe("targets from one graveyard, or one player's", () => {
  it("Decompose: three cards from one graveyard; a card from another isn't offered", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bobs = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const decompose = toHand(game, "Decompose");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: decompose, targets: [ref(bobs[0]), ref(mine)] })).toMatch(
      /another/,
    );
    cast(game, decompose, { targets: bobs.map(ref) });
    expect(bobs.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("Witness the Future: the target player's cards into their library, and you take one of your top four", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bobsCards = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    const giant = toLibrary(game, "Hill Giant", A);
    a.chooseFromZoneFn = () => [giant];
    const witness = toHand(game, "Witness the Future");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: witness, targets: [ref(B), ref(toGraveyard(game, "Grizzly Bears", A))] }),
    ).toMatch(/another/);
    cast(game, witness, { targets: [ref(B), ...bobsCards.map(ref)] });
    expect(bobsCards.map((id) => zone(game, id))).toEqual(["library", "library"]);
    expect(game.state.zones.perPlayer[B].library).toEqual(expect.arrayContaining(bobsCards));
    expect(zone(game, giant)).toBe("hand");
  });

  it("Mutiny: the second creature must be the same opponent's", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const mutiny = toHand(game, "Mutiny");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: mutiny, targets: [ref(giant), ref(carols)] })).toMatch(
      /another/,
    );
    cast(game, mutiny, { targets: [ref(giant), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("repeat this process", () => {
  it("Expansion Algorithm: proliferate X times", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { "+1/+1": 1 };
    cast(game, toHand(game, "Expansion Algorithm"), { x: 3 });
    expect(counters(game, bears)).toBe(4);
  });

  it("Ad Nauseam: a card and its mana value in life, as many times as you choose", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return asked === 1 ? [0] : [];
    };
    const before = hand(game).length;
    cast(game, toHand(game, "Ad Nauseam"));
    // Hill Giant (4), then the Bears (2), then stop.
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(14);
  });

  it("Grindstone: mills again while the pair shares a color", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const stone = spawn(game, "Grindstone");
    // Bob's library from the top: two green, then a green and a red.
    toLibrary(game, "Hill Giant", B);
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Grizzly Bears", B);
    const before = graveyard(game, B).length;
    activate(game, stone, 0, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(before + 4);
  });
});

describe("the lead's follow-ups", () => {
  it("Quandrix Command: counters and the shuffle mode together — the group reads its own mode's player", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears", A);
    const bobsCards = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    const mine = toGraveyard(game, "Hill Giant", A);
    const command = toHand(game, "Quandrix Command");
    // Modes 3 and 4: the creature is slot 0, the player slot 1, the cards from slot 2.
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: command, modes: [2, 3], targets: [ref(bears), ref(B), ref(mine)] }),
    ).toMatch(/another/);
    cast(game, command, { modes: [2, 3], targets: [ref(bears), ref(B), ...bobsCards.map(ref)] });
    expect(counters(game, bears)).toBe(2);
    expect(bobsCards.map((id) => zone(game, id))).toEqual(["library", "library"]);
  });

  it("Ruin Grinder: everyone decides before anyone discards", () => {
    const { game, a, b } = table();
    const grinder = spawn(game, "Ruin Grinder");
    a.chooseModesFn = () => [0];
    const aliceHand = [...hand(game, A)];
    let aliceHandWhenBobChose: readonly string[] = [];
    b.chooseModesFn = () => {
      aliceHandWhenBobChose = [...hand(game, A)];
      return [0];
    };
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: grinder }]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(aliceHandWhenBobChose).toEqual(aliceHand);
    expect(hand(game, A)).toHaveLength(7);
    expect(hand(game, B)).toHaveLength(7);
  });
});
