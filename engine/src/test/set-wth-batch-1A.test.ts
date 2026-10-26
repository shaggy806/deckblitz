/**
 * Weatherlight (WTH; B175), group A. One test per card whose behaviour is
 * more than a stat line or an exact copy of an already-tested pattern, on the
 * clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
  enter,
} from "./harness.js";

describe("WTH group A", () => {
  it("Angelic Renewal: sacrificed to return the creature that died", () => {
    const { game, a } = table();
    const renewal = spawn(game, "Angelic Renewal");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, bears);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(zone(game, renewal)).toBe("graveyard");
  });

  it("Angelic Renewal: declined, it stays and the creature stays dead", () => {
    const { game, a } = table();
    const renewal = spawn(game, "Angelic Renewal");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    destroy(game, bears);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    expect(zone(game, renewal)).toBe("battlefield");
  });

  it("Goblin Bomb: a flip moves the fuse by one; five fuses and a sacrifice deal 20", () => {
    const { game, a } = table({ life: 40 });
    const bomb = spawn(game, "Goblin Bomb");
    game.state.objects[bomb].counters.fuse = 2;
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect([1, 3]).toContain(counters(game, bomb, "fuse"));
    game.state.objects[bomb].counters.fuse = 5;
    activate(game, bomb, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, bomb)).toBe("graveyard");
  });

  it("Pendrell Mists: each creature is sacrificed on its controller's upkeep unless {1} is paid", () => {
    const { game } = table();
    spawn(game, "Pendrell Mists");
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    nextTurn(game); // bob's turn: only bob's creature's ability fires
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    nextTurn(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });

  it("Fire Whip: the enchanted creature taps to deal 1 damage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Fire Whip"), { targets: [ref(bears)] });
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Jangling Automaton: attacking untaps the defending player's creatures", () => {
    const { game, a } = table();
    const automaton = spawn(game, "Jangling Automaton");
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    attack(game, a, [automaton]);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(game.state.objects[mine].tapped).toBe(true);
  });

  it("Revered Unicorn: leaving gains life equal to its age counters", () => {
    const { game } = table();
    const unicorn = spawn(game, "Revered Unicorn");
    game.state.objects[unicorn].counters.age = 3;
    destroy(game, unicorn);
    expect(life(game, A)).toBe(23);
  });

  it("Jabari's Banner: the creature gains flanking, which shrinks a blocker", () => {
    const { game, a, b } = table();
    lands(game, "Wastes", 1);
    const banner = spawn(game, "Jabari's Banner");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    activate(game, banner, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flanking")).toBe(true);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, blocker)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Fog Elemental: sacrificed at end of combat after attacking", () => {
    const { game, a } = table();
    const fog = spawn(game, "Fog Elemental");
    attack(game, a, [fog]);
    expect(life(game, B)).toBe(16);
    expect(zone(game, fog)).toBe("graveyard");
  });

  it("Sylvan Hierophant: exiled as it returns another creature card to hand", () => {
    const { game, a } = table();
    const hierophant = spawn(game, "Sylvan Hierophant");
    const card = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, card);
    destroy(game, hierophant);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Sylvan Hierophant")).toBe(false);
    expect(
      Object.values(game.state.objects).some((o) => o.cardName === "Sylvan Hierophant" && o.zone === "exile"),
    ).toBe(true);
  });

  it("Straw Golem: sacrificed when an opponent casts a creature spell", () => {
    const { game } = table();
    const golem = spawn(game, "Straw Golem");
    lands(game, "Forest", 2, B);
    nextTurn(game);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(zone(game, golem)).toBe("graveyard");
  });

  it("Llanowar Sentinel: paying {1}{G} puts another Sentinel onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const other = toLibrary(game, "Llanowar Sentinel");
    pickModes(a, 0);
    pickFromZone(a, other);
    enter(game, "Llanowar Sentinel");
    settle(game);
    expect(named(game, "Llanowar Sentinel", A)).toHaveLength(2);
  });

  it("Sawtooth Ogre: deals 1 damage to its blocker at end of combat, even after dying", () => {
    const { game, a, b } = table();
    const ogre = spawn(game, "Sawtooth Ogre");
    const wurm = spawn(game, "Craw Wurm", B);
    b.declareBlockersFn = () => [{ blocker: wurm, attacker: ogre }];
    attack(game, a, [ogre]);
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
  });
});
