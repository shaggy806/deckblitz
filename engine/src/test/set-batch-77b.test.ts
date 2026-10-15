/**
 * Set walk batch 77, part b (2026-10-15): Teenage Mutant Ninja Turtles (TMT), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  blockOffer,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** A real token (`spawn` of a token's card isn't one). */
function makeToken(game: Game, name: string, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}

describe("April, Reporter of the Weird", () => {
  it("draws as many cards as the combat damage she dealt, then discards one", () => {
    const { game, a } = table();
    const april = spawn(game, "April, Reporter of the Weird");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(april)]);
    settle(game);
    const before = hand(game).length;
    const discardedBefore = graveyard(game).length;
    attack(game, a, [april]);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(before + 3 - 1);
    expect(graveyard(game).length).toBe(discardedBefore + 1);
  });
});

describe("Casey Jones, Vigilante", () => {
  it("draws three, then discards three at random at its controller's next upkeep only", () => {
    const { game, a } = table();
    const before = hand(game).length;
    enter(game, "Casey Jones, Vigilante");
    expect(hand(game).length).toBe(before + 3);
    // Nobody chooses a random discard.
    a.chooseDiscardsFn = () => {
      throw new Error("a random discard asked for a choice");
    };
    // Bob's upkeep isn't "your next upkeep".
    toStep(game, "draw", B);
    expect(graveyard(game).length).toBe(0);
    const held = hand(game).length;
    toStep(game, "draw");
    settle(game);
    // Discarded three at the upkeep, then drew for the turn.
    expect(graveyard(game).length).toBe(3);
    expect(hand(game).length).toBe(held - 3 + 1);
  });
});

describe("Turtle Power!", () => {
  it("gives Turtles you control +2/+2, and nothing else", () => {
    const { game } = table();
    const turtle = spawn(game, "Horned Turtle");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Horned Turtle", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Turtle Power!"));
    expect(pt(game, turtle)).toEqual({ power: 3, toughness: 6 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 4 });
  });
});

describe("Tokka & Rahzar, Terrible Twos", () => {
  it("deals 3 damage to a player who cast a spell for less mana than its mana value", () => {
    const { game } = table();
    spawn(game, "Tokka & Rahzar, Terrible Twos");
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    lands(game, "Plains", 2);
    // {4}{W} reduced by {3}: 2 mana spent on a mana value 5 spell.
    cast(game, toHand(game, "Grounded for Life"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20);
  });

  it("doesn't trigger on a spell paid in full", () => {
    const { game } = table();
    spawn(game, "Tokka & Rahzar, Terrible Twos");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(20);
  });

  it("an {X} spell paid in full doesn't trigger it", () => {
    const { game } = table();
    spawn(game, "Tokka & Rahzar, Terrible Twos");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 2 });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Grounded for Life", () => {
  it("costs {3} less when it targets a tapped creature", () => {
    const { game } = table();
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const untapped = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 2);
    const card = toHand(game, "Grounded for Life");
    expect(() => cast(game, card, { targets: [ref(untapped)] })).toThrow();
    cast(game, card, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
    expect(zone(game, untapped)).toBe("battlefield");
  });
});

describe("Rocksteady, Crash Courser", () => {
  it("it and the Boars you control can't be blocked by more than one creature", () => {
    const { game, a } = table();
    const rocksteady = spawn(game, "Rocksteady, Crash Courser");
    const boar = spawn(game, "Nettle Swine");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [rocksteady, boar, bears]);
    expect([...(offer.singleBlockerAttackers ?? [])].sort()).toEqual([rocksteady, boar].sort());
  });

  it("forestcycles for {2}", () => {
    const { game, a } = table();
    const forest = game.debugSpawn("Forest", A, "library");
    lands(game, "Swamp", 2);
    const card = toHand(game, "Rocksteady, Crash Courser");
    pickFromZone(a, forest);
    const offer = game.legalActions(A).find((o) => o.kind === "cycle" && o.card === card);
    expect(offer).toBeDefined();
    game.dispatch({ type: "cycle", player: A, card } as never);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(zone(game, forest)).toBe("hand");
  });
});

describe("Shredder's Armor", () => {
  it("attaches as it enters and gives +2/+1", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const armor = enter(game, "Shredder's Armor");
    expect(game.state.objects[armor].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });

  it("equips by sacrificing another nonland permanent, once each turn", () => {
    const { game } = table();
    const armor = spawn(game, "Shredder's Armor");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const ring = spawn(game, "Sol Ring");
    const stone = spawn(game, "Mind Stone");
    const [forest] = lands(game, "Forest", 1);
    const equip = (target: ObjectId, sacrifice: ObjectId) =>
      ({ type: "activate-ability", player: A, source: armor, abilityIndex: 0, targets: [ref(target)], sacrifice }) as const;
    // Not itself, and not a land.
    expect(() => game.dispatch(equip(bears, armor))).toThrow();
    expect(() => game.dispatch(equip(bears, forest))).toThrow();
    expect(zone(game, armor)).toBe("battlefield");
    expect(zone(game, forest)).toBe("battlefield");
    game.dispatch(equip(bears, ring));
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    // Once each turn.
    expect(game.canDispatch(equip(giant, stone))).not.toBeNull();
  });
});

describe("Donatello, Turtle Techie", () => {
  it("draws a card only if you control an artifact", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Donatello, Turtle Techie");
    expect(hand(game).length).toBe(before);
    spawn(game, "Sol Ring");
    enter(game, "Donatello, Turtle Techie");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Spicy Oatmeal Pizza", () => {
  it("deals 4 damage to any target and 3 to you as it enters, and is a Food", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const pizza = enter(game, "Spicy Oatmeal Pizza");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(17);
    lands(game, "Mountain", 2);
    game.dispatch({ type: "activate-ability", player: A, source: pizza, abilityIndex: 0, targets: [] });
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(zone(game, pizza)).toBe("graveyard");
  });

  it("deals nothing to you when its target is gone", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    game.debugSpawn("Spicy Oatmeal Pizza", A, "battlefield", { announceEntry: true, summoningSick: false });
    // The trigger is waiting on the stack; the target leaves in response.
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(game, bears);
    settle(game);
    expect(life(game, A)).toBe(20);
  });
});

describe("Koya, Death from Above", () => {
  it("returns the exiled card at the next end step if you don't pay {3}{B}", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(giant)]);
    settle(game);
    pickTargets(a, giant);
    enter(game, "Koya, Death from Above");
    expect(zone(game, giant)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(B);
    expect(counters(game, giant)).toBe(0);
  });

  it("keeps it exiled when you pay", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Koya, Death from Above");
    const swamps = lands(game, "Swamp", 4);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    expect(swamps.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("returns it when you could pay but don't", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Koya, Death from Above");
    lands(game, "Swamp", 4);
    pickModes(a);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("still returns it after Koya has left", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const koya = enter(game, "Koya, Death from Above");
    destroy(game, koya);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("a token exiled this way doesn't come back", () => {
    const { game, a } = table();
    const token = makeToken(game, "Soldier Token", B);
    pickTargets(a, token);
    enter(game, "Koya, Death from Above");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Soldier Token")).toHaveLength(0);
  });

  it("a commander its owner moved to the command zone stays there", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.state.objects[giant].isCommander = true;
    pickTargets(a, giant);
    enter(game, "Koya, Death from Above");
    expect(zone(game, giant)).toBe("command");
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("command");
  });

  it("can't target itself", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a);
    const koya = enter(game, "Koya, Death from Above");
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(koya);
  });
});

describe("Mind Transfer Protocol", () => {
  it("makes an artifact a 4/5 artifact creature until end of turn, and draws", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    lands(game, "Island", 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Mind Transfer Protocol"), { targets: [ref(ring)] });
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 5 });
    expect(hand(game).length).toBe(before + 1);
    toStep(game, "end", B);
    expect(types(game, ring)).not.toContain("creature");
  });

  it("sets base P/T, so counters still apply", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Mind Transfer Protocol"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 6 });
    expect(types(game, bears)).toContain("artifact");
  });
});

describe("Henchbots", () => {
  it("exiles a tapped creature an opponent controls until it leaves", () => {
    const { game, a } = table();
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const untapped = spawn(game, "Hill Giant", B);
    pickTargets(a, tapped);
    const bots = enter(game, "Henchbots");
    expect(zone(game, tapped)).toBe("exile");
    expect(zone(game, untapped)).toBe("battlefield");
    destroy(game, bots);
    settle(game);
    expect(zone(game, tapped)).toBe("battlefield");
    expect(controller(game, tapped)).toBe(B);
  });
});

describe("Henchbots, targets", () => {
  it("can't exile an untapped creature, nor one of yours", () => {
    const { game } = table();
    const untapped = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant", A, { tapped: true });
    enter(game, "Henchbots");
    expect(zone(game, untapped)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Ragamuffin Raptor", () => {
  it("returns up to one creature or Food card from your graveyard", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const pizza = toGraveyard(game, "Anchovy & Banana Pizza");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [pizza]);
    enter(game, "Ragamuffin Raptor");
    expect([...seen.offered[0]].sort()).toEqual([bears, pizza].sort());
    expect(seen.offered[0]).not.toContain(bolt);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(zone(game, pizza)).toBe("hand");
  });

  it("may return nothing", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    watchTargets(a);
    enter(game, "Ragamuffin Raptor");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("The Neutrinos", () => {
  it("alliance: gets +1/+0 until end of turn whenever another creature you control enters", () => {
    const { game } = table();
    const neutrinos = spawn(game, "The Neutrinos");
    enter(game, "Grizzly Bears");
    enter(game, "Grizzly Bears", B);
    expect(pt(game, neutrinos)).toEqual({ power: 3, toughness: 4 });
  });

  it("blinks a creature you own into the attack, tapped and attacking, as a new object", () => {
    const { game, a } = table();
    const neutrinos = spawn(game, "The Neutrinos");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: neutrinos, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears)).toBe(0);
    expect(game.state.objects[bears].attacking).not.toBeNull();
    expect(game.state.objects[bears].attackedThisTurn).not.toBe(true);
    toStep(game, "postcombat-main");
    // The Neutrinos 2 (+1 from the Bears entering) and the Bears 2.
    expect(life(game, B)).toBe(15);
  });

  it("a token exiled this way doesn't come back", () => {
    const { game, a } = table();
    const neutrinos = spawn(game, "The Neutrinos");
    const token = makeToken(game, "Soldier Token");
    pickTargets(a, token);
    attack(game, a, [neutrinos]);
    expect(game.battlefield).not.toContain(token);
    expect(named(game, "Soldier Token")).toHaveLength(0);
  });
});
