/**
 * Decayed (rule 702.147a): "This creature can't block" and "When this
 * creature attacks, sacrifice it at end of combat" — a keyword that carries
 * its trigger, so a creature that gains it has both halves. And the cards
 * that make decayed Zombies: Wilhelt, the Rotcleaver, Crowded Crypt, Ghoulish
 * Procession, Curse of the Restless Dead, Jadar, Ghoulcaller of Nephalia.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { whyCannotBlock } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const WILHELT_ZOMBIE = "Zombie Token (Wilhelt, the Rotcleaver)";

const ROT = "Test Touch of Rot";
const touchOfRot = defineCard({
  name: ROT,
  manaCost: "{0}",
  types: ["instant"],
  text: "Target creature gains decayed until end of turn.",
  targets: ["creature"],
  effect: { kind: "grant-keyword", target: 0, keyword: "decayed", duration: "end-of-turn" },
});

/** A real decayed Zombie token for `player` (a debug spawn isn't a token). */
const decayedZombie = (game: Game, player: PlayerId = A): ObjectId => {
  const before = new Set(game.state.zones.shared.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: WILHELT_ZOMBIE, count: 1 }, []);
  settle(game);
  return game.state.zones.shared.battlefield.find((id) => !before.has(id))!;
};

describe("decayed", () => {
  it("can't block", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const zombie = decayedZombie(game, B);
    const bear2 = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(whyCannotBlock(game.state, game.registry, B, zombie, bears)).toMatch(/can't block/);
    expect(whyCannotBlock(game.state, game.registry, B, bear2, bears)).toBeNull();
  });

  it("is sacrificed at end of combat once it has attacked — after its combat damage", () => {
    const { game, a } = table();
    const zombie = decayedZombie(game);
    // Made this turn: it attacks on the next.
    nextTurn(game);
    attack(game, a, [zombie]);
    expect(life(game, B)).toBe(18);
    // A token that leaves stops existing.
    expect(game.state.objects[zombie]?.zone).not.toBe("battlefield");
  });

  it("a creature that gains decayed has its trigger too", () => {
    const { game, a } = table();
    game.registry.register(touchOfRot);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, ROT), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a decayed counter gives it decayed (rule 122.1b), trigger and all", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "decayed", amount: 1 }, [ref(bears)]);
    settle(game);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("one that doesn't attack stays", () => {
    const { game, a } = table();
    const zombie = decayedZombie(game);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(zone(game, zombie)).toBe("battlefield");
  });
});

describe("the decayed Zombie makers", () => {
  it("Wilhelt: another Zombie without decayed dying makes one; a decayed one dying doesn't", () => {
    const { game } = table();
    spawn(game, "Wilhelt, the Rotcleaver");
    const zombie = spawn(game, "Gravecrawler");
    const decayed = decayedZombie(game);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Murder"), { targets: [ref(zombie)] });
    expect(tokensNamed(game, WILHELT_ZOMBIE, A)).toBe(2);
    cast(game, toHand(game, "Murder"), { targets: [ref(decayed)] });
    expect(tokensNamed(game, WILHELT_ZOMBIE, A)).toBe(1);
  });

  it("Wilhelt: at the end step, sacrifice a Zombie to draw a card", () => {
    const { game, a } = table();
    spawn(game, "Wilhelt, the Rotcleaver");
    const zombie = decayedZombie(game);
    const wilhelt = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Wilhelt, the Rotcleaver")!;
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [zombie];
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[zombie]?.zone).not.toBe("battlefield");
    expect(zone(game, wilhelt)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Crowded Crypt: a corpse counter for each creature of yours that dies, then that many Zombies", () => {
    const { game } = table();
    const crypt = spawn(game, "Crowded Crypt");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Swamp", 6);
    for (const bear of bears) cast(game, toHand(game, "Murder"), { targets: [ref(bear)] });
    expect(game.state.objects[crypt].counters.corpse).toBe(2);
    lands(game, "Swamp", 6);
    activate(game, crypt, 1);
    expect(zone(game, crypt)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token (Crowded Crypt)", A)).toBe(2);
  });

  it("Ghoulish Procession: once a turn, for nontoken creatures dying together or apart", () => {
    const { game } = table();
    spawn(game, "Ghoulish Procession");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Wrath of God"));
    expect(tokensNamed(game, "Zombie Token (Ghoulish Procession)", A)).toBe(1);
  });

  it("Ghoulish Procession ignores a token dying", () => {
    const { game } = table();
    spawn(game, "Ghoulish Procession");
    const zombie = decayedZombie(game);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(zombie)] });
    expect(tokensNamed(game, "Zombie Token (Ghoulish Procession)", A)).toBe(0);
  });

  it("Curse of the Restless Dead: a Zombie for its caster whenever a land of the enchanted player's enters", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Curse of the Restless Dead"), { targets: [ref(B)] });
    enter(game, "Forest", B);
    enter(game, "Forest", A);
    expect(tokensNamed(game, "Zombie Token (Curse of the Restless Dead)", A)).toBe(1);
  });

  it("Jadar: a Zombie at the end step only while there's no decayed creature", () => {
    const { game } = table();
    spawn(game, "Jadar, Ghoulcaller of Nephalia");
    const name = "Zombie Token (Jadar, Ghoulcaller of Nephalia)";
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, name, A)).toBe(1);
    nextTurn(game);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, name, A)).toBe(1);
  });
});
