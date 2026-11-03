/**
 * What an earlier step of a resolution did, read by a later one: permanents
 * that changed hands (`"gained-control"`) or that a control effect applied to
 * (`"control-effect"`), permanents put back onto the battlefield, cards revealed
 * or shuffled in, and the count a surveil kept on top (`keptOnTopThisWay`).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;
const setTapped = (game: Game, id: ObjectId): void => {
  game.state.objects[id].tapped = true;
};
const emptyLibrary = (game: Game, player = A): void => {
  game.state.zones.perPlayer[player].library.length = 0;
};

describe("a control effect's permanents", () => {
  it("Broadcast Takeover takes, untaps and hastes the artifacts it took, and only those", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const theirs = spawn(game, "Ornithopter", B);
    setTapped(game, theirs);
    const mine = spawn(game, "Ornithopter", A);
    setTapped(game, mine);
    const creature = spawn(game, "Grizzly Bears", B);
    setTapped(game, creature);
    cast(game, toHand(game, "Broadcast Takeover"));
    expect(controller(game, theirs)).toBe(A);
    expect(tapped(game, theirs)).toBe(false);
    expect(keywords(game, theirs).has("haste")).toBe(true);
    // Yours already: not gained, not untapped.
    expect(tapped(game, mine)).toBe(true);
    expect(keywords(game, mine).has("haste")).toBe(false);
    expect(controller(game, creature)).toBe(B);
    expect(tapped(game, creature)).toBe(true);
  });

  it("Mob Rule also untaps and hastes the matching creatures you already control (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const mine = spawn(game, "Craw Wurm", A);
    setTapped(game, mine);
    const theirs = spawn(game, "Craw Wurm", B);
    setTapped(game, theirs);
    const small = spawn(game, "Grizzly Bears", B);
    setTapped(game, small);
    cast(game, toHand(game, "Mob Rule"), { modes: [0] });
    for (const id of [mine, theirs]) {
      expect(controller(game, id)).toBe(A);
      expect(tapped(game, id)).toBe(false);
      expect(keywords(game, id).has("haste")).toBe(true);
    }
    expect(controller(game, small)).toBe(B);
    expect(tapped(game, small)).toBe(true);
  });

  it("Mob Rule's second mode takes power 3 or less", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const big = spawn(game, "Craw Wurm", B);
    const small = spawn(game, "Grizzly Bears", B);
    setTapped(game, small);
    cast(game, toHand(game, "Mob Rule"), { modes: [1] });
    expect(controller(game, small)).toBe(A);
    expect(tapped(game, small)).toBe(false);
    expect(controller(game, big)).toBe(B);
  });

  it("Mob Rule's set isn't re-read: a creature pumped past the line by the change still untaps", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    // Under alice's anthem a 3-power creature is 4: the filter matched it at 3,
    // but "those creatures" is who the effect applied to.
    spawn(game, "Glorious Anthem", A);
    const three = spawn(game, "Hill Giant", B);
    setTapped(game, three);
    cast(game, toHand(game, "Mob Rule"), { modes: [1] });
    expect(controller(game, three)).toBe(A);
    expect(computeCharacteristics(game.state, game.registry, three).power).toBe(4);
    expect(tapped(game, three)).toBe(false);
    expect(keywords(game, three).has("haste")).toBe(true);
  });

  it("gaining control of what you already control is no gain, though the effect applied", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const cards = hand(game).length;
    game.debugApplyEffect(
      A,
      {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false },
          { kind: "conditional", condition: { kind: "this-way", what: "gained-control" }, then: { kind: "draw", amount: 1 } },
          { kind: "conditional", condition: { kind: "this-way", what: "control-effect" }, then: { kind: "draw", amount: 2 } },
        ],
      },
      [ref(mine)],
    );
    expect(hand(game).length).toBe(cards + 2);
  });

  it("Coveted Falcon turned up draws one a permanent given away", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const falcon = toHand(game, "Coveted Falcon");
    cast(game, falcon, { via: "face-down" });
    expect(game.state.objects[falcon].faceDown).toBeDefined();
    const one = spawn(game, "Ornithopter");
    const two = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    pickTargets(a, B, one, two);
    game.dispatch({ type: "turn-face-up", player: A, permanent: falcon, morph: true });
    settle(game);
    expect(controller(game, one)).toBe(B);
    expect(controller(game, two)).toBe(B);
    expect(controller(game, falcon)).toBe(A);
    expect(hand(game).length).toBe(before + 2);
  });

  it("Coveted Falcon attacking takes back a permanent you own", () => {
    const { game, a } = table();
    const falcon = spawn(game, "Coveted Falcon");
    const mine = spawn(game, "Ornithopter");
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false, who: { target: 1 } }, [ref(mine), ref(B)]);
    expect(controller(game, mine)).toBe(B);
    pickTargets(a, mine);
    attack(game, a, [falcon]);
    expect(controller(game, mine)).toBe(A);
  });

  it("Kain gives himself away, and his old controller draws, makes Treasure and pays", () => {
    const { game, a } = table();
    const kain = spawn(game, "Kain, Traitorous Dragoon");
    const before = life(game);
    const cards = hand(game).length;
    attack(game, a, [kain]);
    expect(controller(game, kain)).toBe(B);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(cards + 2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    for (const t of named(game, "Treasure Token", A)) expect(tapped(game, t)).toBe(true);
    expect(life(game)).toBe(before - 2);
  });

  it("Kain has flying only on his controller's turn", () => {
    const { game } = table();
    const kain = spawn(game, "Kain, Traitorous Dragoon");
    expect(keywords(game, kain).has("flying")).toBe(true);
    toStep(game, "upkeep", B);
    expect(keywords(game, kain).has("flying")).toBe(false);
  });

  it("Yes Man changes hands, then draws two and takes a quest counter; leaving, its owner gets Soldiers", () => {
    const { game } = table();
    const man = spawn(game, "Yes Man, Personal Securitron", A, { sick: false });
    const cards = hand(game).length;
    activate(game, man, 0, { targets: [ref(B)] });
    settle(game);
    expect(controller(game, man)).toBe(B);
    expect(hand(game).length).toBe(cards + 2);
    expect(counters(game, man, "quest")).toBe(1);
    // It's bob's now, but alice owns it.
    destroy(game, man, B);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(0);
    expect(tapped(game, named(game, "Soldier Token", A)[0])).toBe(true);
  });

  it("Yes Man already gone: nothing changes hands and there is no reflexive draw", () => {
    const { game } = table();
    const man = spawn(game, "Yes Man, Personal Securitron", A, { sick: false });
    const cards = hand(game).length;
    activate(game, man, 0, { targets: [ref(B)], settle: false });
    destroy(game, man, B);
    settle(game);
    expect(hand(game).length).toBe(cards);
    expect(counters(game, man, "quest")).toBe(0);
  });
});

describe("a permanent returned to the battlefield", () => {
  it("Wake the Past hastes what came back, and nothing else", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    lands(game, "Plains", 1);
    const here = spawn(game, "Ornithopter");
    const back = toGraveyard(game, "Ornithopter");
    const creature = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Wake the Past"));
    expect(zone(game, back)).toBe("battlefield");
    expect(keywords(game, back).has("haste")).toBe(true);
    expect(keywords(game, here).has("haste")).toBe(false);
    expect(zone(game, creature)).toBe("graveyard");
  });
});

describe("cards revealed or shuffled this way", () => {
  it("Madcap Experiment counts the artifact it found too, and the rest go to the bottom", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    emptyLibrary(game);
    const under = toLibrary(game, "Wastes");
    const artifact = toLibrary(game, "Ornithopter");
    const one = toLibrary(game, "Wastes");
    const two = toLibrary(game, "Wastes");
    game.state.zones.perPlayer[A].library.splice(0, 4, two, one, artifact, under);
    const before = life(game);
    cast(game, toHand(game, "Madcap Experiment"));
    expect(zone(game, artifact)).toBe("battlefield");
    expect(life(game)).toBe(before - 3);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(under);
  });

  it("Madcap Experiment with no artifact reveals the whole library", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    emptyLibrary(game);
    for (let i = 0; i < 5; i += 1) toLibrary(game, "Wastes");
    const before = life(game);
    cast(game, toHand(game, "Madcap Experiment"));
    expect(life(game)).toBe(before - 5);
    expect(game.state.zones.perPlayer[A].library.length).toBe(5);
  });

  it("Goblin Charbelcher counts nonland cards, and doubles for a Mountain", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const belcher = spawn(game, "Goblin Charbelcher");
    emptyLibrary(game);
    const wall = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Ornithopter"), toLibrary(game, "Swamp")];
    game.state.zones.perPlayer[A].library.splice(0, 3, ...wall);
    const start = life(game, B);
    activate(game, belcher, 0, { targets: [ref(B)] });
    settle(game);
    expect(life(game, B)).toBe(start - 2);
    // On the bottom, all three, in the order chosen.
    expect(new Set(game.state.zones.perPlayer[A].library)).toEqual(new Set(wall));
  });

  it("Goblin Charbelcher hitting a Mountain deals double", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const belcher = spawn(game, "Goblin Charbelcher");
    emptyLibrary(game);
    const wall = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Ornithopter"), toLibrary(game, "Mountain")];
    game.state.zones.perPlayer[A].library.splice(0, 3, ...wall);
    const start = life(game, B);
    activate(game, belcher, 0, { targets: [ref(B)] });
    settle(game);
    expect(life(game, B)).toBe(start - 4);
  });

  it("Goblin Charbelcher with no land counts every card revealed", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const belcher = spawn(game, "Goblin Charbelcher");
    emptyLibrary(game);
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Ornithopter");
    const start = life(game, B);
    activate(game, belcher, 0, { targets: [ref(B)] });
    settle(game);
    expect(life(game, B)).toBe(start - 3);
  });

  it("Kamahl's Summons makes each player Bears for their own reveals", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 4);
    const mine = [toHand(game, "Grizzly Bears"), toHand(game, "Ornithopter")];
    const theirs = toHand(game, "Grizzly Bears", B);
    toHand(game, "Forest", B);
    pickFromZone(a, mine[0], mine[1]);
    pickFromZone(b, theirs);
    cast(game, toHand(game, "Kamahl's Summons"));
    expect(tokensNamed(game, "Bear Token", A)).toBe(2);
    expect(tokensNamed(game, "Bear Token", B)).toBe(1);
    expect(zone(game, mine[0])).toBe("hand");
  });

  it("Kamahl's Summons: a player who reveals nothing gets nothing", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 4);
    toHand(game, "Grizzly Bears");
    const theirs = toHand(game, "Grizzly Bears", B);
    pickFromZone(a);
    pickFromZone(b, theirs);
    cast(game, toHand(game, "Kamahl's Summons"));
    expect(tokensNamed(game, "Bear Token", A)).toBe(0);
    expect(tokensNamed(game, "Bear Token", B)).toBe(1);
  });

  it("Naya Soulbeast enters with the revealed cards' total mana value, known before it resolves", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    emptyLibrary(game);
    emptyLibrary(game, B);
    toLibrary(game, "Craw Wurm"); // 6
    toLibrary(game, "Grizzly Bears", B); // 2
    const beast = toHand(game, "Naya Soulbeast");
    cast(game, beast);
    expect(zone(game, beast)).toBe("battlefield");
    expect(counters(game, beast)).toBe(8);
    expect(computeCharacteristics(game.state, game.registry, beast).power).toBe(8);
    expect(keywords(game, beast).has("trample")).toBe(true);
  });

  it("Psychic Spiral mills what it shuffled in, not counting itself, and shuffles an empty graveyard", () => {
    const { game } = table();
    lands(game, "Island", 10);
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Wastes");
    const size = game.state.zones.perPlayer[B].library.length;
    const spiral = toHand(game, "Psychic Spiral");
    cast(game, spiral, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(3);
    expect(game.state.zones.perPlayer[B].library.length).toBe(size - 3);
    expect(zone(game, spiral)).toBe("graveyard");
    expect(graveyard(game, A)).toEqual([spiral]);
    // Nothing to shuffle in: nothing milled.
    const again = toHand(game, "Psychic Spiral");
    game.state.zones.perPlayer[A].graveyard.length = 0;
    const left = game.state.zones.perPlayer[B].library.length;
    cast(game, again, { targets: [ref(B)] });
    expect(game.state.zones.perPlayer[B].library.length).toBe(left);
  });
});

describe("cards kept on top", () => {
  const revenant = (game: Game, seat: ScriptedController, away: readonly ObjectId[], top: readonly ObjectId[]): void => {
    game.state.zones.perPlayer[A].library.splice(0, top.length, ...top);
    seat.chooseScryFn = () => away;
  };

  it("Starving Revenant draws and pays for each card kept, and none for one binned", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    emptyLibrary(game);
    const keep = toLibrary(game, "Wastes");
    const bin = toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    revenant(game, a, [bin], [keep, bin]);
    const cards = hand(game).length;
    const before = life(game);
    cast(game, toHand(game, "Starving Revenant"));
    settle(game);
    expect(zone(game, bin)).toBe("graveyard");
    expect(hand(game)).toContain(keep);
    expect(hand(game).length).toBe(cards + 1);
    expect(life(game)).toBe(before - 3);
  });

  it("Starving Revenant keeping both pays for both; binning both, nothing", () => {
    const { game, a } = table();
    lands(game, "Swamp", 8);
    emptyLibrary(game);
    const first = toLibrary(game, "Wastes");
    const second = toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    revenant(game, a, [], [first, second]);
    const before = life(game);
    cast(game, toHand(game, "Starving Revenant"));
    settle(game);
    expect(life(game)).toBe(before - 6);
    const library = game.state.zones.perPlayer[A].library;
    const top = [library[0], library[1]];
    revenant(game, a, top, top);
    const after = life(game);
    cast(game, toHand(game, "Starving Revenant"));
    settle(game);
    expect(life(game)).toBe(after);
  });

  it("Descend 8: a draw with eight permanent cards in the graveyard drains an opponent", () => {
    const { game } = table();
    spawn(game, "Starving Revenant");
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes");
    const opp = life(game, B);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(life(game, B)).toBe(opp);
    toGraveyard(game, "Wastes");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(life(game, B)).toBe(opp - 1);
  });
});
